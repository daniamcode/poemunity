const { Schema, model } = require('mongoose')

// The notification types. Kept here rather than as loose strings so the enum,
// the preference keys and the trigger sites cannot drift apart.
const NOTIFICATION_TYPE = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  NEW_POEM: 'newPoem',
  // A comment on your AUTHOR PAGE, which is a different event from a comment on
  // a poem: it shares the comments route but its target is an author, so it was
  // dropped rather than misrouted as a poem comment. That left it notifying
  // NOBODY — somebody writes on your profile and you never learn. Reported from
  // production, 2026-08-04.
  PROFILE_COMMENT: 'profileComment',
  // Somebody answered a comment YOU wrote, anywhere — including on a poem that
  // is not yours. `parentId` was stored from the beginning and never used to
  // notify, so this was silent in exactly the way profile comments were.
  REPLY: 'reply'
}

const NOTIFICATION_TYPES = Object.values(NOTIFICATION_TYPE)

// One row per (recipient, thing that happened) — but NOT one row per actor.
//
// Twelve people liking the same poem is ONE notification that says twelve, not
// twelve rows: an unbatched feed buries the comment somebody wrote you under a
// wall of identical like rows, which is how a bell becomes something people
// learn to ignore. Collapsing is therefore a property of the storage, not of
// the rendering — the alternative is grouping on read, which cannot work here
// because "read" state is per-row and a group has no single read state.
//
// `actors` is the collapsed list, newest first, capped: the UI shows a couple of
// names ("Ada, Milo and 10 others") and the count carries the rest, so keeping
// every id would grow a document unboundedly for a popular poem to render two
// names from it.
const notificationSchema = new Schema({
  // Who is being told. Every query is scoped by this and nothing else.
  //
  // Deliberately NOT `index: true`. A standalone `{ recipient: 1 }` is a strict
  // PREFIX of both compound indexes below, and MongoDB uses a compound index
  // from any prefix of its keys — so it would answer no query that they cannot,
  // while costing an extra index write on every insert and every collapse.
  recipient: { type: Schema.Types.ObjectId, ref: 'Author', required: true },

  type: { type: String, enum: NOTIFICATION_TYPES, required: true },

  // Who did it. Newest first. See the cap in utils/notifications.js.
  actors: [{ type: Schema.Types.ObjectId, ref: 'Author' }],

  // How many distinct actors this row represents. NOT `actors.length` — the
  // array is capped and the count is not, so once a poem passes the cap these
  // two deliberately disagree and the count is the honest one.
  count: { type: Number, default: 1 },

  // The poem this is about, for every type except `follow` and the profile ones.
  poem: { type: Schema.Types.ObjectId, ref: 'Poem' },

  // The AUTHOR PAGE this is about, for comments and replies on a profile.
  //
  // Not derivable from `recipient`: for a profileComment the target and the
  // recipient are the same author, but for a REPLY on somebody else's page they
  // are not — the thread is on their page, and you are only in it. Storing the
  // destination is the only way the row can link where the conversation is.
  profile: { type: Schema.Types.ObjectId, ref: 'Author' },

  read: { type: Boolean, default: false },

  // Bumped on every collapse, so a row that keeps attracting likes rises back
  // to the top instead of sinking under newer, quieter events.
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: true, updatedAt: false } })

// The list: everything for one recipient, newest activity first.
//
// Sorted by `updatedAt`, not `createdAt`, because a collapse updates a row in
// place — ordering by creation would leave a poem that gathered fifty likes
// this morning sitting wherever its first like landed last week.
//
// `_id` is the tie-break for the same reason it is on the follow indexes:
// notifications created in one burst share a timestamp, and a paginated sort
// with arbitrary ties repeats rows across page boundaries.
notificationSchema.index({ recipient: 1, updatedAt: -1, _id: -1 })

// The unread badge, and the collapse lookup.
//
// Both queries are "this recipient, unread" — the badge counts them and the
// collapse looks for an existing unread row to merge into. Merging into a READ
// row is deliberately not done: you already saw that notification, so a new
// like on the same poem has to be able to make it unread again, and the
// cleanest way to say that is to leave read rows alone and start a new one.
notificationSchema.index({ recipient: 1, read: 1, type: 1, poem: 1 })

notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

module.exports = model('Notification', notificationSchema)
module.exports.NOTIFICATION_TYPE = NOTIFICATION_TYPE
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES
