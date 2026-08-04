const mongoose = require('mongoose')
const Notification = require('../models/Notification')
const { NOTIFICATION_TYPE, NOTIFICATION_TYPES } = require('../models/Notification')
const Author = require('../models/Author')

// How many actor ids a collapsed row keeps. The UI renders "Ada, Milo and 10
// others", so it needs a couple of names and a number — not every id. Without a
// cap a popular poem's row grows without bound to render two names from it.
const MAX_ACTORS = 5

/**
 * Is this author willing to be told about this kind of event?
 *
 * ABSENT MEANS ON. Every author predates `notificationPrefs`, so nothing is
 * stored for any of them, and reading that as "wants nothing" would silently
 * disable notifications for the entire existing user base. Same equivalence as
 * `Poem.status` treating missing as published.
 *
 * Mongoose does fill the schema defaults when it HYDRATES a document, so the
 * `findById` path below would survive a `=== true` test today — which is
 * exactly why `!== false` is worth keeping and worth testing directly. Add
 * `.lean()` to that lookup, an ordinary performance change, and the defaults
 * vanish along with the safety net. The rule lives in this one function so
 * there is a single thing to get right.
 */
function isNotificationEnabled (author, type) {
  return author?.notificationPrefs?.[type] !== false
}

/**
 * Record that something happened to somebody.
 *
 * Collapses into an existing UNREAD row of the same (recipient, type, poem)
 * rather than adding another: twelve likes on one poem is one row saying
 * twelve. A READ row is deliberately never merged into — you already saw it, so
 * a new like has to be able to raise a fresh unread one.
 *
 * NEVER THROWS. A notification is a side effect of somebody else's action, and
 * failing to record one must not fail the like, the comment or the follow that
 * caused it. Errors are logged and swallowed.
 *
 * Self-actions are dropped here rather than at the call sites, so a new trigger
 * cannot forget: liking your own poem, commenting on it, and the publish fan-out
 * reaching a poet who follows themselves all resolve to the same no-op.
 */
async function notify ({ recipientId, actorId, type, poemId, recipient: preloaded }) {
  try {
    if (!recipientId || !actorId || !NOTIFICATION_TYPES.includes(type)) return null

    // String comparison on both sides: req.userId is a string out of a
    // JSON-serialized JWT while the ids from a document are ObjectIds, and
    // `===` between them is always false — which would make every self-action
    // notify after all.
    if (String(recipientId) === String(actorId)) return null

    // `preloaded` is supplied by notifyMany, which fetches every recipient's
    // preferences in ONE query rather than one per recipient. The preference
    // CHECK still happens here either way, so the rule has a single home no
    // matter which path got us the author.
    const recipient = preloaded ?? await Author.findById(recipientId).select('notificationPrefs')
    if (!recipient || !isNotificationEnabled(recipient, type)) return null

    const actor = new mongoose.Types.ObjectId(String(actorId))
    const filter = {
      recipient: new mongoose.Types.ObjectId(String(recipientId)),
      type,
      read: false,
      // `poem: null` for a follow, which is what makes follows collapse with
      // each other and never with a poem event.
      poem: poemId ? new mongoose.Types.ObjectId(String(poemId)) : null
    }

    const existing = await Notification.findOne(filter)

    if (!existing) {
      return await Notification.create({ ...filter, actors: [actor], count: 1, updatedAt: new Date() })
    }

    // The same person liking, unliking and liking again must not read as two
    // people. The count tracks DISTINCT actors, so a repeat only bumps the row
    // back to the top.
    const alreadyThere = existing.actors.some(id => String(id) === String(actor))
    if (!alreadyThere) {
      existing.actors = [actor, ...existing.actors].slice(0, MAX_ACTORS)
      existing.count += 1
    }
    existing.updatedAt = new Date()
    return await existing.save()
  } catch (error) {
    // Logged, not rethrown — see the docblock.
    console.error('notify failed:', error.message)
    return null
  }
}

/**
 * Fan out one event to many recipients (a poet publishing, to their followers).
 *
 * Sequential rather than parallel on purpose: each recipient's write is a
 * find-then-update against their own row, and firing hundreds at once would
 * open hundreds of connections on a serverless function that has few. This is
 * the write-amplification ceiling of the whole design — at a few thousand
 * followers it should become a queue, or the event should move to fan-out ON
 * READ (query poems by followed authors since last seen) instead.
 *
 * PREFERENCES ARE FETCHED ONCE for the whole fan-out. Letting each notify() do
 * its own lookup made publishing cost 3 round trips per follower instead of 2,
 * all of them serial and all inside the request that the poet is waiting on;
 * for a poet with 200 followers that is 200 identical-shaped queries. This
 * lowers the slope, not the ceiling — the queue is still the answer past a few
 * thousand.
 *
 * `.lean()` is safe here for one specific reason: Mongoose fills schema
 * defaults on HYDRATION, so a lean author has no `notificationPrefs` at all —
 * and `isNotificationEnabled` reads absent as ON rather than testing `=== true`.
 * That is the whole reason it is written that way. Do not "tighten" it.
 */
async function notifyMany ({ recipientIds, actorId, type, poemId }) {
  // Deduped: a fan-out list is assembled from follow edges, and one duplicate
  // would otherwise pay for the same recipient twice.
  const ids = [...new Set((recipientIds || []).map(id => String(id)))]
  if (ids.length === 0) return

  let recipients = []
  try {
    recipients = await Author.find({ _id: { $in: ids } }).select('notificationPrefs').lean()
  } catch (error) {
    // Same contract as notify(): a notification must never fail the action that
    // caused it, so a failed fan-out is logged and the publish still succeeds.
    console.error('notifyMany failed to load recipients:', error.message)
    return
  }

  // Iterating the FOUND authors rather than the requested ids also preserves
  // notify()'s old behaviour of skipping a recipient who no longer exists.
  for (const recipient of recipients) {
    await notify({ recipientId: recipient._id, actorId, type, poemId, recipient })
  }
}

module.exports = { notify, notifyMany, isNotificationEnabled, MAX_ACTORS, NOTIFICATION_TYPE }
