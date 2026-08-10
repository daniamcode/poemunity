import { Poem } from '../typescript/interfaces'
import { slugify } from './urlUtils'

/**
 * JSON-LD builders for the pages that list poems.
 *
 * The governing rule is that structured data must describe what is actually
 * VISIBLE on the page. Markup that claims more than the page shows is a
 * spam-policy violation, not a clever optimisation — so the item lists here are
 * built from the poems the page really rendered, never from the total.
 */

const SITE = 'Poemunity'

export interface JsonLdObject {
    '@context'?: string
    '@type': string
    [key: string]: unknown
}

function poemUrl(baseUrl: string, poem: Poem): string {
    return `${baseUrl}/detail/${poem.slug || poem.id}`
}

/**
 * The poems the page rendered, as an ordered list. `position` is 1-based, which
 * schema.org requires.
 */
function itemList(baseUrl: string, poems: Poem[]): JsonLdObject {
    return {
        '@type': 'ItemList',
        itemListElement: poems
            .filter(poem => poem?.title && (poem.slug || poem.id))
            .map((poem, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: poemUrl(baseUrl, poem),
                name: poem.title
            }))
    }
}

/**
 * The site itself, for the HOMEPAGE only.
 *
 * `SearchAction` is the one part of this with a visible payoff: it is what can
 * earn a sitelinks searchbox, letting people search Poemunity from the results
 * page. Its target is `/?q=` because that is the URL the homepage search bar
 * actually produces — markup describing a search endpoint the site does not
 * have would be a claim, not a description.
 *
 * Homepage only, deliberately. `WebSite` is a statement about the site, not the
 * page, and repeating it on every listing page would assert the same entity at
 * a dozen URLs; the listing pages already reference it through `isPartOf`.
 */
export function websiteStructuredData(baseUrl: string): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE,
        url: baseUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    }
}

/**
 * Who publishes the site. Kept minimal on purpose: `Organization` is where a
 * logo, a founding date and social profiles would go, and every one of those is
 * a factual claim about a real entity. Only the name, the URL and the logo the
 * site actually serves are stated.
 */
export function organizationStructuredData(baseUrl: string): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE,
        url: baseUrl,
        logo: `${baseUrl}/og-image.png`
    }
}

export interface AuthorsIndexStructuredDataArgs {
    /** The letter this page lists, e.g. 'A'. */
    letter: string
    description: string
    url: string
    baseUrl: string
    authors?: { slug: string, name: string }[]
}

/**
 * The author index, as the collection of poets it renders.
 *
 * Built from the authors on THIS letter, never from the 3,364 total — the same
 * rule the poem item lists follow. A page listing 251 poets that claimed 3,364
 * would be describing a page that does not exist.
 *
 * The entries are plain `ListItem`s — a name and a URL — and deliberately NOT
 * `Person`. The list mixes real users, famous poets and AI personas, and a
 * `Person` entity for a generated account asserts in machine-readable form that
 * a human exists, which is the claim the AI disclosure exists to prevent. That
 * rule lives on the author pages too; here it is the reason this list is flat.
 */
export function authorsIndexStructuredData({
    letter,
    description,
    url,
    baseUrl,
    authors = []
}: AuthorsIndexStructuredDataArgs): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Poets starting with ${letter}`,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE, url: baseUrl },
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: authors
                .filter(author => author?.slug && author?.name)
                .map((author, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `${baseUrl}/authors/${author.slug}`,
                    name: author.name
                }))
        }
    }
}

export interface GenreStructuredDataArgs {
    label: string
    description: string
    url: string
    baseUrl: string
    poems?: Poem[]
}

export function genreStructuredData({
    label,
    description,
    url,
    baseUrl,
    poems = []
}: GenreStructuredDataArgs): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${label} poems`,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE, url: baseUrl },
        mainEntity: itemList(baseUrl, poems)
    }
}

export interface AuthorStructuredDataArgs {
    name: string
    description: string
    url: string
    baseUrl: string
    bio?: string
    image?: string
    /** Author record's `type`. 'ai' suppresses the Person entity — see below. */
    authorType?: string | null
    poems?: Poem[]
}

/**
 * A CollectionPage for the author's poems, with a Person as its author — EXCEPT
 * for AI personas.
 *
 * Emitting `Person` for a generated account would assert to search engines that
 * a real human exists, in the same markup Google uses for knowledge-panel
 * entities. The site discloses AI-assisted activity in the footer and with a
 * badge on every AI poem and comment; publishing machine-readable claims to the
 * contrary would undo exactly that. So AI author pages describe the collection
 * and stay silent about who wrote it, rather than lying in a format built to be
 * trusted.
 */
export function authorStructuredData({
    name,
    description,
    url,
    baseUrl,
    bio,
    image,
    authorType,
    poems = []
}: AuthorStructuredDataArgs): JsonLdObject {
    const page: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `Poems by ${name}`,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE, url: baseUrl },
        mainEntity: itemList(baseUrl, poems)
    }

    if (authorType === 'ai') {
        return page
    }

    const person: JsonLdObject = { '@type': 'Person', name, url }
    if (bio?.trim()) person.description = bio.trim()
    if (image) person.image = image

    return { ...page, author: person }
}

export interface PoemStructuredDataArgs {
    poem: Poem
    url: string
    baseUrl: string
}

/**
 * schema.org has an exact type for this — `Poem`, a subtype of CreativeWork —
 * so there is no need to describe it as a generic Article.
 *
 * `text` carries the poem because it is fully visible on the page; the same rule
 * that keeps item lists honest allows this. The like count is included for the
 * same reason: it is rendered right there in the footer.
 *
 * `commentCount` is deliberately absent. Comments are lazy-loaded and their
 * count is not known at render time, and inventing a number — or paying for an
 * extra request to learn it — is worse than omitting an optional field.
 */
export function poemStructuredData({ poem, url, baseUrl }: PoemStructuredDataArgs): JsonLdObject {
    const data: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'Poem',
        name: poem.title,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE, url: baseUrl }
    }

    if (poem.poem) data.text = poem.poem
    if (poem.genre) data.genre = poem.genre
    if (poem.date) data.datePublished = poem.date

    if (Array.isArray(poem.likes)) {
        data.interactionStatistic = {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: poem.likes.length
        }
    }

    // Same rule as the author pages: no Person entity for an AI persona, because
    // that would assert a real human exists in the very format search engines
    // treat as authoritative.
    if (poem.authorType !== 'ai' && poem.author) {
        const slug = poem.authorSlug || slugify(poem.author)
        data.author = {
            '@type': 'Person',
            name: poem.author,
            ...(slug ? { url: `${baseUrl}/authors/${slug}` } : {})
        }
    }

    return data
}

export interface Crumb {
    name: string
    /** Site-relative path. Omitted on the current page, which is not a link. */
    path?: string
}

/**
 * BreadcrumbList — the one type here that Google actually renders as a search
 * feature, replacing the raw URL with a `Poemunity › Love › Title` trail.
 *
 * The final crumb carries no `item`: it is the current page, so it is not a link
 * on screen either, and the markup mirrors that. Google documents both forms as
 * valid; matching the visible state is the version that stays honest.
 */
export function breadcrumbStructuredData(crumbs: Crumb[], baseUrl: string): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            ...(crumb.path ? { item: `${baseUrl}${crumb.path}` } : {})
        }))
    }
}
