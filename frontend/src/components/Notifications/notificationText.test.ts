import { actorSummary, notificationMessage, notificationHref } from './notificationText'
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
