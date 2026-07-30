import { Poem } from '../typescript/interfaces'

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
