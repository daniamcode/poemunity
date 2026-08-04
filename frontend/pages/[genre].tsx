import { GetServerSideProps } from 'next'
import Dashboard from '../src/components/Dashboard/Dashboard'
import { SeoHead } from '../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../src/lib/serverApi'
import { InitialPoemsData } from '../src/components/List/hooks/usePoemsList'
import capitalizeFirstLetter from '../src/utils/capitalizeFirstLetter'
import { JsonLd } from '../src/components/JsonLd'
import { Breadcrumbs } from '../src/components/Breadcrumbs'
import { genreStructuredData } from '../src/utils/structuredData'
import { genreTitle, genreDescription } from '../src/utils/seo'
import { ORDER_BY_LIKES, SEARCH_MIN_LENGTH, isKnownCategorySlug } from '../src/data/constants'

interface PageProps {
    initialData: InitialPoemsData | null
    initialUser: ServerUser | null
    genre: string
    baseUrl: string
    /** Whether this render is a search result rather than the genre itself. */
    isSearch: boolean
}

export default function GenrePage({ initialData, genre, baseUrl, isSearch }: PageProps) {
    const label = capitalizeFirstLetter(genre.replace(/-/g, ' '))
    const total = initialData?.total ?? 0
    // A known category that simply has nothing in it yet — not an unknown one,
    // which getServerSideProps already answers 404 for.
    const isEmpty = total === 0
    const url = `${baseUrl}/${genre}`
    const description = genreDescription(label, total, initialData?.poems)

    return (
        <>
            {/* Search URLs are noindex,follow with a canonical back to the clean
                genre page. Three separate jobs: noindex keeps an unbounded set of
                thin ?q= pages out of the index, `follow` still lets the crawler
                use the links on them, and the canonical consolidates any signal
                onto /love. The count would be wrong on them anyway — `total` is
                the FILTERED total, so an indexed ?q= page would claim the genre
                holds 3 poems. */}
            {/* An EMPTY genre is noindex too. Eleven categories currently hold
                no poems at all — Easter, Graduation, Wedding and so on — and
                each rendered a 200 with a heading and nothing under it. That is
                the shape Google files as a soft 404, and it is the same shape
                that got `/authors/[slug]` indexed before it started answering
                404 properly.

                `follow` rather than `nofollow`: the page is worthless to a
                searcher today but its navigation is not, and the moment somebody
                publishes a Wedding poem the tag disappears on its own. Nothing
                to remember, nothing to undo. */}
            <SeoHead
                title={genreTitle(label, total)}
                description={description}
                url={url}
                noIndex={isSearch || isEmpty}
                followLinks={isSearch || isEmpty}
            />
            {/* Not on search results: the markup would describe a filtered
                subset while claiming to be the genre's collection page, and the
                page is noindex anyway. */}
            {!isSearch && (
                <JsonLd
                    id='genre-collection'
                    data={genreStructuredData({
                        label,
                        description,
                        url,
                        baseUrl,
                        poems: initialData?.poems
                    })}
                />
            )}
            <Breadcrumbs
                baseUrl={baseUrl}
                crumbs={[{ name: 'Poemunity', path: '/' }, { name: label }]}
            />
            <Dashboard initialData={initialData ?? undefined} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, query }) => {
    const requested = params?.genre as string
    const genre = requested.toLowerCase()
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`

    // Genre slugs are lowercase, but the route matched ANY casing: /Home, /HOME
    // and /hOmE all rendered the same 63 poems, each page canonicalising to the
    // URL it was requested on. That is unbounded duplicate content — every
    // genre times every casing — with each copy declaring itself the original.
    // (Same rule the poem pages already follow: canonicalise to the slug, never
    // to the requested URL.) 308 rather than 301 so the method is preserved and
    // the redirect is explicitly permanent for crawlers.
    if (requested !== genre) {
        const qs = typeof query.q === 'string' && query.q ? `?q=${encodeURIComponent(query.q)}` : ''
        return { redirect: { destination: `/${genre}${qs}`, permanent: true } }
    }

    // A slug that is neither a curated category nor backed by any poem used to
    // render a perfectly normal-looking page: /asdfnonsense returned HTTP 200,
    // an "Asdfnonsense poems" heading and a self-referencing canonical. That is
    // a soft 404 — an unbounded set of crawlable, self-canonical URLs.
    //
    // The check cannot be "is it in CATEGORIES" alone: the database holds four
    // genres that list does not (anger, imagination, spirituality, sports —
    // ~168 real poems, almost all scraped famous ones), and 404ing those would
    // delete live pages. So an unknown slug earns one unfiltered probe, and
    // survives if it actually has poems. Only unknown slugs pay for it; curated
    // ones skip straight through.
    //
    // The probe deliberately ignores ?q=: searching a real genre for something
    // it does not contain is an empty result, not a missing page.
    if (!isKnownCategorySlug(genre)) {
        const probe = await serverFetch<InitialPoemsData>('/api/v1/poems', {
            page: 1,
            limit: 1,
            genre
        }, token)
        if (!probe || probe.total === 0) return { notFound: true }
    }

    // See the note in pages/index.tsx: ?q= has to be honoured server-side or the
    // seeded search box renders next to an unfiltered list.
    const q = typeof query.q === 'string' ? query.q.trim() : ''
    const data = await serverFetch<InitialPoemsData>('/api/v1/poems', {
        page: 1,
        limit: 10,
        genre,
        orderBy: ORDER_BY_LIKES,
        ...(q.length >= SEARCH_MIN_LENGTH && { q })
    }, token)
    return {
        props: {
            initialData: data,
            initialUser: await fetchServerUser(token),
            genre,
            baseUrl,
            isSearch: q.length >= SEARCH_MIN_LENGTH
        }
    }
}
