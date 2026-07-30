import { Poem } from '../typescript/interfaces'

/**
 * Test fixtures whose identifiers are DELIBERATELY DIFFERENT from each other.
 *
 * A poem is addressed by `slug` in the URL and by `id` in the normalized store;
 * an author by `authorSlug` in the URL and `userId` in the store. Fixtures that
 * reuse one value for both roles make an entire class of bug untestable — and
 * did: useDetailPoem looked the entity up with the URL parameter, so every visit
 * to /detail/<slug> missed the store and likes never re-rendered. All 984 tests
 * passed, because every one of them addressed the hook by id.
 *
 * Default to these rather than hand-rolling a literal, and keep the values
 * distinct when you override them.
 */
export function makePoem(overrides: Partial<Poem> = {}): Poem {
    return {
        // ObjectId-shaped, and nothing like the slug.
        id: '69f0cb2d9496d1ecf2660f6c',
        slug: 'rock-salvation-mordecai-ben-isaac',
        title: 'Rock of My Salvation',
        poem: 'Mighty, praised beyond compare,\nRock of my salvation',
        author: 'Mordecai ben Isaac',
        // Author id and author slug differ for the same reason.
        userId: '6a076c7d0472cf659e70e866',
        authorSlug: 'mordecai-ben-isaac',
        genre: 'faith',
        likes: [],
        picture: '',
        date: '2024-01-15T10:30:00.000Z',
        ...overrides
    }
}
