import {
    genreTitle,
    authorTitle,
    genreDescription,
    authorDescription,
    poemTitle,
    poemDescription
} from './seo'
import { Poem } from '../typescript/interfaces'

const poem = (title: string, author: string): Poem => ({
    id: title,
    author,
    date: '2024-01-15T10:30:00.000Z',
    genre: 'love',
    likes: [],
    picture: '',
    poem: 'content',
    title,
    userId: 'user-1'
})

describe('seo titles', () => {
    describe('genreTitle', () => {
        test('leads with the count', () => {
            expect(genreTitle('Love', 46)).toBe('46 Love poems')
        })

        // "1 Love poems" is the kind of thing that survives to production.
        test('is singular for one poem', () => {
            expect(genreTitle('Love', 1)).toBe('1 Love poem')
        })

        // "0 Love poems" reads worse than saying nothing about the count.
        test('drops the number entirely when the genre is empty', () => {
            expect(genreTitle('Love', 0)).toBe('Love poems')
        })
    })

    describe('authorTitle', () => {
        // "poems by X", not "X poems": people search the former, and the
        // keyword-dense form reads like a product listing for a person.
        test('reads as "N poems by NAME"', () => {
            expect(authorTitle('John Doe', 35)).toBe('35 poems by John Doe')
        })

        test('is singular for one poem', () => {
            expect(authorTitle('John Doe', 1)).toBe('1 poem by John Doe')
        })

        test('stays grammatical with no count, capitalised as a title', () => {
            expect(authorTitle('John Doe', 0)).toBe('Poems by John Doe')
        })
    })
})

describe('seo descriptions', () => {
    describe('genreDescription', () => {
        // The whole point: without samples, twelve genres share one sentence
        // with a single word swapped.
        test('names up to two real poems so each genre differs', () => {
            const result = genreDescription('Love', 46, [
                poem('The Sound of Rain', 'Marta Ruiz'),
                poem('Silence', 'Ana Gil'),
                poem('Third', 'Ignored Poet')
            ])

            expect(result).toContain('Read 46 love poems on Poemunity')
            expect(result).toContain('“The Sound of Rain” by Marta Ruiz')
            expect(result).toContain('“Silence” by Ana Gil')
            expect(result).not.toContain('Third')
        })

        test('stays a clean sentence when there are no poems to name', () => {
            expect(genreDescription('Love', 0)).toBe(
                'Read love poems on Poemunity. Discover, like and share community poetry.'
            )
        })

        test('ignores entries missing a title or author rather than printing blanks', () => {
            const result = genreDescription('Love', 2, [
                { ...poem('Untitled', 'Ana'), title: '' },
                poem('Real Title', 'Ana Gil')
            ])

            expect(result).toContain('“Real Title” by Ana Gil')
            expect(result).not.toContain('“” by')
        })

        test('is singular for one poem', () => {
            expect(genreDescription('Love', 1)).toContain('Read 1 love poem on Poemunity')
        })
    })

    describe('authorDescription', () => {
        // The bio used to REPLACE this sentence, so a bio that never mentions
        // poetry left the description with no sign the page lists poems.
        test('leads with the count, then appends the bio', () => {
            expect(authorDescription('John Doe', 35, 'Grew up in Cádiz.')).toBe(
                '35 poems by John Doe on Poemunity. Grew up in Cádiz.'
            )
        })

        test('falls back to a useful sentence with no bio', () => {
            expect(authorDescription('John Doe', 35)).toBe(
                '35 poems by John Doe on Poemunity. Read, like and share their poetry.'
            )
        })

        test('treats a whitespace-only bio as absent', () => {
            expect(authorDescription('John Doe', 2, '   ')).toContain('Read, like and share')
        })

        test('is singular for one poem', () => {
            expect(authorDescription('John Doe', 1)).toContain('1 poem by John Doe')
        })

        test('stays grammatical with no poems', () => {
            expect(authorDescription('John Doe', 0)).toContain('Poems by John Doe on Poemunity.')
        })
    })
})

describe('poem metadata', () => {
    describe('poemTitle', () => {
        // No count, no decoration: people search a poem's title next to its
        // poet, so the plain phrase is the strongest form this can take.
        test('reads "TITLE by AUTHOR"', () => {
            expect(poemTitle('The Sound of Rain', 'Marta Ruiz')).toBe('The Sound of Rain by Marta Ruiz')
        })

        test('drops the attribution when there is no author', () => {
            expect(poemTitle('The Sound of Rain')).toBe('The Sound of Rain')
        })

        test('falls back to something sayable when the title is empty', () => {
            expect(poemTitle('', 'Marta Ruiz')).toBe('Poem by Marta Ruiz')
        })
    })

    describe('poemDescription', () => {
        // A poem is mostly line breaks, and they land in the meta tag verbatim.
        test('flattens the poem onto one line', () => {
            expect(poemDescription('I miss you like\n\nthe moon misses the sun'))
                .toBe('I miss you like the moon misses the sun')
        })

        test('leaves a short poem untouched', () => {
            expect(poemDescription('Short and complete.')).toBe('Short and complete.')
        })

        test('cuts on a word boundary, not mid-word', () => {
            const result = poemDescription('word '.repeat(60))

            expect(result.length).toBeLessThanOrEqual(155)
            expect(result.endsWith('word…')).toBe(true)
        })

        test('does not leave dangling punctuation before the ellipsis', () => {
            const result = poemDescription(`${'word '.repeat(30)}end, ${'more '.repeat(20)}`)

            expect(result).not.toContain(',…')
        })

        // No space to cut on: a hard cut beats returning nothing.
        test('still truncates a single unbroken run', () => {
            const result = poemDescription('x'.repeat(300))

            expect(result.length).toBeLessThanOrEqual(155)
            expect(result.endsWith('…')).toBe(true)
        })

        test('uses the fallback for an empty poem', () => {
            expect(poemDescription('', 'A poem on Poemunity.')).toBe('A poem on Poemunity.')
        })
    })
})
