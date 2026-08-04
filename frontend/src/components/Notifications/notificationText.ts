import { format, formatDistanceStrict } from 'date-fns'
import { NotificationRow } from '../../redux/reducers/notificationsReducers'

/**
 * Turn a collapsed notification row into a sentence.
 *
 * Pure, and separate from the component, because this is where every off-by-one
 * in the feature would live: a row carries a `count` of DISTINCT actors and a
 * capped `actors` array, so "and N others" has to be computed from the count,
 * never from the array length — past the cap those disagree, and the array is
 * the one that lies.
 *
 * Singular and plural are both spelled out rather than sprouting an "(s)".
 */

/** Names shown before the "and N others" tail. */
const NAMES_SHOWN = 2

function displayName(actor: { name?: string; username?: string }): string {
    return actor?.name || actor?.username || 'Someone'
}

export function actorSummary(row: Pick<NotificationRow, 'actors' | 'count'>): string {
    const actors = row.actors || []
    const count = row.count ?? actors.length

    if (actors.length === 0) return 'Someone'

    const names = actors.slice(0, NAMES_SHOWN).map(displayName)
    // Computed from `count`, not `actors.length` — see the docblock.
    const others = count - names.length

    if (others <= 0) {
        if (names.length === 1) return names[0]
        return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
    }

    return `${names.join(', ')} and ${others} ${others === 1 ? 'other' : 'others'}`
}

export function notificationMessage(row: NotificationRow): string {
    const who = actorSummary(row)
    const count = row.count ?? 1
    const plural = count > 1

    switch (row.type) {
        case 'like':
            return `${who} liked your poem`
        case 'comment':
            // "commented on" reads wrong for a group; "left comments on" does not.
            return plural ? `${who} left comments on your poem` : `${who} commented on your poem`
        case 'reply':
            // "replied to you", not "replied to your comment" — shorter, and a
            // reply can only be to a comment here. No plural form: "Ada and 2
            // others replied to you" is already what `who` produces.
            return `${who} replied to you`
        case 'profileComment':
            // "your page", not "your profile": /profile is the private settings
            // screen, and this comment is on the PUBLIC author page.
            return plural ? `${who} left comments on your page` : `${who} commented on your page`
        case 'follow':
            return plural ? `${who} started following you` : `${who} started following you`
        case 'newPoem':
            // The fan-out is one poem to many followers, so this row always has
            // exactly one actor — the poet. No plural form is reachable.
            return `${who} published a new poem`
        default:
            return `${who} did something`
    }
}

/** Where the row links. A follow goes to the follower; everything else to the poem. */
export function notificationHref(row: NotificationRow): string | null {
    // Your OWN author page. The slug is served on the row rather than derived
    // from the username, because the real one comes from the display name and
    // gains a numeric suffix on collision — a guess 404s for anyone whose slug
    // was ever contested.
    // A profile comment, or a reply in a thread on somebody's author page.
    // `profile` is the page the conversation is ON, which for a reply is not
    // necessarily yours.
    if (row.type === 'profileComment' || (row.type === 'reply' && !row.poem)) {
        return row.profile?.slug ? `/authors/${row.profile.slug}` : null
    }
    if (row.type === 'follow') {
        const actor = (row.actors || [])[0]
        // Falls back to the id because a slug is not guaranteed, and a link to
        // nothing is worse than a row that is not a link.
        const target = actor?.slug || actor?.id
        return target ? `/authors/${target}` : null
    }
    const target = row.poem?.slug || row.poem?.id
    return target ? `/detail/${target}` : null
}

// Anything older than this shows a calendar date instead of a distance.
// "3 months ago" is a worse answer than "05/12/2025" — past a week nobody is
// counting, they want to know when.
const RELATIVE_LIMIT_SECONDS = 7 * 24 * 60 * 60

/** Below this, distance formatting says "0 seconds", which reads as broken. */
const JUST_NOW_SECONDS = 60

/**
 * WHICH timestamp a row carries is a real decision, not a detail.
 *
 * `updatedAt`, never `createdAt`. A collapse updates the row IN PLACE — twelve
 * likes on one poem is one row — and the list is ordered by `updatedAt` for
 * exactly that reason. Labelling with `createdAt` would put "last week" at the
 * top of the list on a row that gathered its latest like a minute ago, so the
 * timestamp would contradict the ordering it sits in.
 *
 * `now` is injectable so tests are deterministic. A relative timestamp read
 * from the system clock is untestable by construction — it changes between the
 * fixture and the assertion.
 */
function rowDate(row: Pick<NotificationRow, 'updatedAt' | 'createdAt'>): Date | null {
    const iso = row.updatedAt || row.createdAt
    if (!iso) return null
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? null : date
}

export function notificationTimestamp(
    row: Pick<NotificationRow, 'updatedAt' | 'createdAt'>,
    now: Date = new Date()
): string {
    const date = rowDate(row)
    if (!date) return ''

    const seconds = (now.getTime() - date.getTime()) / 1000

    // Negative covers clock skew between the server's timestamp and the
    // browser's clock. "in 4 seconds" on a notification is worse than nothing.
    if (seconds < JUST_NOW_SECONDS) return 'Just now'
    if (seconds < RELATIVE_LIMIT_SECONDS) return formatDistanceStrict(date, now, { addSuffix: true })

    return format(date, 'MM/dd/yyyy')
}

/**
 * The full timestamp, for the `title` and the `<time>` element's own value.
 * The relative form is the readable one; this is the precise one, and it uses
 * the same format the poem dates elsewhere on the site use.
 */
export function notificationExactTime(
    row: Pick<NotificationRow, 'updatedAt' | 'createdAt'>
): string {
    const date = rowDate(row)
    return date ? format(date, "MM/dd/yyyy HH:mm'h'") : ''
}

/** The machine-readable value for `<time dateTime>`. */
export function notificationDateTimeAttr(
    row: Pick<NotificationRow, 'updatedAt' | 'createdAt'>
): string | undefined {
    const date = rowDate(row)
    return date ? date.toISOString() : undefined
}
