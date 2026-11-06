import Link from 'next/link'
import { CATEGORIES, categoryToSlug } from '../../data/constants'

// NO scss import here. Next.js permits global CSS only from `pages/_app.tsx`,
// which is where `Categories.scss` is registered alongside every other
// component's stylesheet.

/**
 * THE CATEGORY HUB: every genre on one server-rendered page.
 *
 * WHY IT EXISTS. The header dropdown showed only the 26 `MUST_HAVE_CATEGORIES`
 * and revealed the rest behind a client-side `onClick`, so those links existed
 * in the DOM only after a click. A crawler following links from the homepage
 * therefore reached exactly those 26 genres — fantasy, mythology, grief and
 * the rest had NO server-rendered inbound link anywhere on the site, and were
 * reachable only through the sitemap. Measured on the live site before this
 * page: zero inbound links to `/fantasy` across all 135 genre pages, and
 * `/categories` itself answered 404.
 *
 * This is the shape `/authors` already solves for its 3,000+ pages: one
 * indexable index, linked from every other page, linking to all of them. That
 * index is where 88% of the site's clicks come from.
 *
 * No `getServerSideProps`. `CATEGORIES` is a compile-time constant, so the
 * document is byte-identical for every request — adding SSR would buy nothing
 * but a render per request, which is why the canonical comes from
 * `canonicalUrl` exactly as `/privacy` and `/terms` do.
 *
 * The intro prose is deliberately NOT copied from `genreIntros`. Those
 * paragraphs already live on the genre pages; repeating 100+ of them here
 * would put the same text on two URLs, which is the duplication this page is
 * meant to reduce rather than create.
 */
export default function CategoriesPage() {
    const sorted = [...CATEGORIES].sort((a, b) => a.localeCompare(b))

    return (
        <article className='categories-page'>
            <header className='categories-page__header'>
                <p className='categories-page__eyebrow'>Browse the collection</p>
                <h1>Poetry Categories</h1>
                <p className='categories-page__intro'>
                    Every theme the collection is filed under, from love and grief to war,
                    childhood and work. A category gathers every poem written on its subject
                    in one place, newest first.
                </p>
                <p className='categories-page__intro'>
                    Many of them open with an introduction to the tradition — what the poems
                    worth rereading tend to do, and which poets to start with. Looking for a
                    poet rather than a theme?{' '}
                    <Link href='/authors'>Browse every author</Link> instead.
                </p>
            </header>

            <ul className='categories-page__list'>
                {sorted.map(category => (
                    <li key={category}>
                        <Link href={`/${categoryToSlug(category)}`}>{category}</Link>
                    </li>
                ))}
            </ul>
        </article>
    )
}
