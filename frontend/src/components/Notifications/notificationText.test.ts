import {
    actorSummary,
    notificationMessage,
    notificationHref,
    notificationTimestamp,
    notificationExactTime,
    notificationDateTimeAttr
} from './notificationText'
import { NotificationRow } from '../../redux/reducers/notificationsReducers'

const actor = (id: string, name: string, extra: any = {}) => ({ id, name, ...extra })

const row = (over: Partial<NotificationRow> = {}): NotificationRow => ({
    id: 'n1',
    type: 'like',
    actors: [actor('a1', 'Ada Brine')],
    count: 1,
    poem: { id: 'p-id-1', slug: 'aubade-nadia', title: 'Aubade' },
    read: false,
    updatedAt: '2026-07-31T10:00:00.000Z',
    createdAt: '2026-07-31T10:00:00.000Z',
    ...over
})

/**
 * The message builder is where every off-by-one in this feature would live.
 *
 * A row carries `count` (DISTINCT actors, uncapped) and `actors` (capped at 5),
 * so once a poem passes the cap the two DISAGREE — and the array is the one
 * that lies. Every "and N others" test below therefore uses a count that is
 * larger than the array, which is the case a `actors.length` implementation
 * gets wrong while passing anything built from a small fixture.
 */
describe('actorSummary', () => {
    test('one actor is just their name', () => {
        expect(actorSummary({ actors: [actor('a1', 'Ada Brine')], count: 1 })).toBe('Ada Brine')
    })

    test('two actors are joined with "and"', () => {
        expect(actorSummary({
            actors: [actor('a1', 'Ada Brine'), actor('a2', 'Milo Vex')],
            count: 2
        })).toBe('Ada Brine and Milo Vex')
    })

    test('counts the others from COUNT, not from the capped array', () => {
        // Twelve people liked it; the row only stored five of them. The answer
        // must be "and 10 others", not "and 3 others".
        expect(actorSummary({
            actors: [
                actor('a1', 'Ada Brine'), actor('a2', 'Milo Vex'), actor('a3', 'Zora'),
                actor('a4', 'Rune'), actor('a5', 'Sol')
            ],
            count: 12
        })).toBe('Ada Brine, Milo Vex and 10 others')
    })

    test('one other is singular', () => {
        expect(actorSummary({
            actors: [actor('a1', 'Ada Brine'), actor('a2', 'Milo Vex')],
            count: 3
        })).toBe('Ada Brine, Milo Vex and 1 other')
    })

    test('falls back to the username, then to "Someone"', () => {
        expect(actorSummary({ actors: [{ id: 'a1', username: 'ada' }], count: 1 })).toBe('ada')
        expect(actorSummary({ actors: [{ id: 'a1' }], count: 1 })).toBe('Someone')
        expect(actorSummary({ actors: [], count: 0 })).toBe('Someone')
    })
})

describe('notificationMessage', () => {
    test('a like', () => {
        expect(notificationMessage(row())).toBe('Ada Brine liked your poem')
    })

    test('one comment reads singular, several read plural', () => {
        expect(notificationMessage(row({ type: 'comment' })))
            .toBe('Ada Brine commented on your poem')
        expect(notificationMessage(row({
            type: 'comment',
            actors: [actor('a1', 'Ada Brine'), actor('a2', 'Milo Vex')],
            count: 2
        }))).toBe('Ada Brine and Milo Vex left comments on your poem')
    })

    test('a follow', () => {
        expect(notificationMessage(row({ type: 'follow', poem: null })))
            .toBe('Ada Brine started following you')
    })

    test('a new poem', () => {
        expect(notificationMessage(row({ type: 'newPoem' })))
            .toBe('Ada Brine published a new poem')
    })
})

describe('notificationHref', () => {
    test('a poem event links to the poem by SLUG', () => {
        // id and slug are deliberately different values in the fixture, so an
        // implementation that linked by id builds a different URL.
        expect(notificationHref(row())).toBe('/detail/aubade-nadia')
    })

    test('a follow links to the FOLLOWER, not to a poem', () => {
        expect(notificationHref(row({
            type: 'follow',
            poem: null,
            actors: [actor('a1', 'Ada Brine', { slug: 'ada-brine' })]
        }))).toBe('/authors/ada-brine')
    })

    test('falls back to the id when there is no slug', () => {
        expect(notificationHref(row({ poem: { id: 'p-id-1', title: 'Aubade' } })))
            .toBe('/detail/p-id-1')
    })

    test('returns null when the target is gone, so the row renders inert', () => {
        // A deleted poem must not become a link to /detail/undefined.
        expect(notificationHref(row({ poem: null }))).toBeNull()
        expect(notificationHref(row({ type: 'follow', poem: null, actors: [] }))).toBeNull()
    })
})


// ---------------------------------------------------------------------------
// Timestamps.
//
// `now` is injected in every case. A relative timestamp read from the system
// clock is untestable by construction — the value changes between building the
// fixture and asserting on it, so a test written that way is either flaky or
// asserts nothing.
// ---------------------------------------------------------------------------
describe('notificationTimestamp', () => {
    const NOW = new Date('2026-08-04T12:00:00.000Z')
    const at = (iso: string) => ({ updatedAt: iso, createdAt: '2020-01-01T00:00:00.000Z' })

    test('uses updatedAt, NOT createdAt', () => {
        // The whole point. A collapse updates the row in place and the list is
        // ordered by updatedAt, so labelling with createdAt would put "6 years
        // ago" at the top of the list on a row that just moved there.
        const value = notificationTimestamp(at('2026-08-04T11:00:00.000Z'), NOW)

        expect(value).toBe('1 hour ago')
    })

    test('falls back to createdAt when updatedAt is missing', () => {
        const value = notificationTimestamp(
            { createdAt: '2026-08-04T10:00:00.000Z' } as never,
            NOW
        )

        expect(value).toBe('2 hours ago')
    })

    test('says "Just now" under a minute, rather than "0 seconds ago"', () => {
        expect(notificationTimestamp(at('2026-08-04T11:59:30.000Z'), NOW)).toBe('Just now')
    })

    test('says "Just now" for a future timestamp, not "in 4 seconds"', () => {
        // Server and browser clocks disagree by seconds routinely.
        expect(notificationTimestamp(at('2026-08-04T12:00:04.000Z'), NOW)).toBe('Just now')
    })

    test('uses a relative distance within the week', () => {
        expect(notificationTimestamp(at('2026-08-04T11:55:00.000Z'), NOW)).toBe('5 minutes ago')
        expect(notificationTimestamp(at('2026-08-02T12:00:00.000Z'), NOW)).toBe('2 days ago')
        expect(notificationTimestamp(at('2026-07-29T12:00:00.000Z'), NOW)).toBe('6 days ago')
    })

    test('switches to a calendar date past a week', () => {
        // "3 months ago" is a worse answer than the date — past a week nobody
        // is counting, they want to know when.
        expect(notificationTimestamp(at('2026-05-12T09:30:00.000Z'), NOW)).toBe('05/12/2026')
    })

    test('the boundary is the week itself, not a whole number of days', () => {
        // Distractor either side of the same threshold: a wrong comparison
        // gives a different answer for exactly one of these two.
        expect(notificationTimestamp(at('2026-07-28T12:00:01.000Z'), NOW)).toBe('7 days ago')
        expect(notificationTimestamp(at('2026-07-28T11:59:59.000Z'), NOW)).toBe('07/28/2026')
    })

    test('returns an empty string rather than "Invalid Date"', () => {
        expect(notificationTimestamp({ updatedAt: 'not-a-date' } as never, NOW)).toBe('')
        expect(notificationTimestamp({} as never, NOW)).toBe('')
    })
})

describe('notificationExactTime', () => {
    test('is the precise moment, in the site’s own date format', () => {
        expect(notificationExactTime({ updatedAt: '2026-08-04T09:05:00.000Z' } as never))
            .toBe('08/04/2026 09:05h')
    })

    test('is empty for an unusable date', () => {
        expect(notificationExactTime({ updatedAt: 'nope' } as never)).toBe('')
    })
})

describe('notificationDateTimeAttr', () => {
    test('is machine-readable ISO, for the <time> element', () => {
        expect(notificationDateTimeAttr({ updatedAt: '2026-08-04T09:05:00.000Z' } as never))
            .toBe('2026-08-04T09:05:00.000Z')
    })

    test('is undefined rather than an empty attribute when unusable', () => {
        // `dateTime=""` is invalid HTML; omitting the attribute is not.
        expect(notificationDateTimeAttr({ updatedAt: 'nope' } as never)).toBeUndefined()
    })
})


describe('profile comments', () => {
    const profileRow = (over: any = {}) => row({
        type: 'profileComment',
        poem: undefined,
        recipient: { slug: 'nadia-novak' },
        ...over
    } as never)

    test('says "your page", not "your profile"', () => {
        // /profile is the private settings screen; this comment is on the
        // PUBLIC author page. Naming the wrong one sends the reader somewhere
        // the comment is not.
        expect(notificationMessage(profileRow())).toBe('Ada Brine commented on your page')
    })

    test('reads plural once several people have written', () => {
        expect(notificationMessage(profileRow({ count: 3 })))
            .toMatch(/left comments on your page$/)
    })

    test('links to YOUR author page, using the served slug', () => {
        expect(notificationHref(profileRow())).toBe('/authors/nadia-novak')
    })

    test('does NOT link to the commenter', () => {
        // The distractor: a follow row links to the actor, and these two are
        // the only types with no poem, so the wrong branch is easy to fall into.
        const href = notificationHref(profileRow({
            actors: [{ id: 'a1', name: 'Ada Brine', slug: 'ada-brine' }]
        }))

        expect(href).toBe('/authors/nadia-novak')
        expect(href).not.toContain('ada-brine')
    })

    test('renders inert rather than guessing a URL when no slug was served', () => {
        expect(notificationHref(profileRow({ recipient: undefined }))).toBeNull()
    })
})
