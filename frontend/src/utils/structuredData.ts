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
