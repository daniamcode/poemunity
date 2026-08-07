import { GetServerSideProps } from 'next'
import AuthorsIndex from '../../src/components/Authors/AuthorsIndex'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../../src/lib/serverApi'
import { Author } from '../../src/typescript/interfaces'
import {
    DEFAULT_LETTER,
    DEFAULT_ORIGIN,
    LETTER_PARAM,
    ORIGIN_PARAM,
    buildAuthorsHref,
    parseLetterParam,
    parseOriginParam
} from '../../src/utils/authorsIndex'

interface PageProps {
    initialLetters: string[] | null
    initialAuthors: Author[] | null
    initialUser: ServerUser | null
    baseUrl: string
    letter: string
    origin: string
}

export default function AuthorsIndexPage({
    initialLetters,
    initialAuthors,
    baseUrl,
    letter,
    origin
}: PageProps) {
    const isFiltered = origin !== DEFAULT_ORIGIN
    const title = letter === DEFAULT_LETTER ? 'Poetry Authors' : `Poets starting with ${letter}`
    const description = letter === DEFAULT_LETTER
        ? 'Browse famous poets, AI-generated authors and community writers. Explore their poems on Poemunity.'
        : `Poets whose name begins with ${letter} — famous, AI-generated and community writers on Poemunity.`

    return (
        <>
            {/* An origin-filtered view is noindex,follow with a canonical back
                to the unfiltered letter, the same treatment `?q=` gets. Its
                authors are a strict SUBSET of the letter page's, so indexing it
                would put the same people on two URLs — but its links are worth
                crawling, hence `follow` rather than `nofollow`.

                The LETTER pages are indexable and self-canonical: they
                partition the authors, so no two of them list the same person. */}
            <SeoHead
                title={title}
                description={description}
                url={`${baseUrl}${buildAuthorsHref(letter)}`}
                noIndex={isFiltered}
                followLinks={isFiltered}
            />
            <AuthorsIndex
                initialLetters={initialLetters ?? undefined}
                initialAuthors={initialAuthors ?? undefined}
                letter={letter}
                origin={origin}
            />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`

    const origin = parseOriginParam(query[ORIGIN_PARAM])

    // `?letter=A`, `?letter=b` and junk all redirect to the canonical URL rather
    // than rendering. Uppercasing a lowercase letter in place would leave two
    // URLs listing the same authors, which is the duplication `/LOVE` → `/love`
    // already exists to prevent.
    const parsed = parseLetterParam(query[LETTER_PARAM])
    if (parsed.kind === 'redirect' && query[LETTER_PARAM] !== undefined) {
        return {
            redirect: { destination: buildAuthorsHref(DEFAULT_LETTER, origin), permanent: false }
        }
    }
    const letter = parsed.kind === 'ok' ? parsed.letter : DEFAULT_LETTER

    // `origin` is the API's `type`, and only when it narrows anything.
    const filter = origin !== DEFAULT_ORIGIN ? { type: origin } : undefined

    const [initialLetters, initialAuthors] = await Promise.all([
        serverFetch<string[]>('/api/v1/authors/letters', filter, token),
        serverFetch<Author[]>('/api/v1/authors', { letter, ...filter }, token)
    ])

    // A letter nobody's name begins with is a 404, not a heading over nothing —
    // the same rule the empty genres and out-of-range pages follow. `A` is
    // exempt: it is the index's own URL, and an index with no authors at all is
    // a real page that says so.
    if (letter !== DEFAULT_LETTER && !initialAuthors?.length) {
        return { notFound: true }
    }

    return {
        props: {
            initialLetters,
            initialAuthors,
            initialUser: await fetchServerUser(token),
            baseUrl,
            letter,
            origin
        }
    }
}
