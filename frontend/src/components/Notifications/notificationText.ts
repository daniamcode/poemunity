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
