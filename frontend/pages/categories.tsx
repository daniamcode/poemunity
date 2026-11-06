import { SeoHead, canonicalUrl } from '../src/components/SeoHead'
import CategoriesPage from '../src/components/Categories/CategoriesPage'

/**
 * `/categories` — the hub every genre hangs off.
 *
 * It exists so the 117 categories outside `MUST_HAVE_CATEGORIES` have an
 * inbound link from somewhere. Before it, the only control that reached them
 * was a `<button onClick>` in the header dropdown, which a crawler never
 * presses: the link was created in the browser, so the server-rendered HTML
 * stopped at the top 26.
 *
 * Statically optimised, like `/privacy` and `/terms`. There is no per-request
 * data here — `CATEGORIES` is a compile-time constant — so `getServerSideProps`
 * would cost a render per request to learn the host, and `canonicalUrl`
 * resolves that for free.
 *
 * Indexable and self-canonical: it is a strict SUPERSET of no other page (it
 * links to every genre rather than narrowing one), so it is the opposite case
 * from the `?q=` and origin-filtered views, which are subsets and therefore
 * `noindex,follow`.
 */
export default function Categories() {
    return (
        <>
            <SeoHead
                title='Poetry Categories'
                description='Every poetry category on Poemunity — love, grief, nature, war, childhood, faith and more. Browse poems organised by theme.'
                url={canonicalUrl('/categories')}
            />
            <CategoriesPage />
        </>
    )
}
