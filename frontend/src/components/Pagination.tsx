import Link from 'next/link'
import { buildPageHref, pageWindow } from '../utils/pagination'

interface PageCellProps {
    /** `null` marks an elided run of pages. */
    page: number | null
    currentPage: number
    href: (page: number) => string
}

function PageCell({ page, currentPage, href }: PageCellProps) {
    if (page === null) {
        return <span className='pagination__gap' aria-hidden='true'>…</span>
    }
    if (page === currentPage) {
        // The current page is not a link — same rule as the last breadcrumb.
        // `aria-current` is what announces it.
        return <span className='pagination__current' aria-current='page'>{page}</span>
    }
    return (
        <Link className='pagination__page' href={href(page)} aria-label={`Page ${page}`}>
            {page}
        </Link>
    )
}

interface PaginationProps {
    /** Path without a query string, e.g. `/love` or `/`. */
    basePath: string
    currentPage: number
    totalPages: number
    /** Other params to keep on every link (`q`, `origin`, `orderBy`). */
    query?: Record<string, string | undefined>
}

/**
 * Real `<a href>` page links, rendered on the server.
 *
 * Deliberately NOT derived from how far infinite scroll has loaded — it
 * describes the URL you are on. A nav that tracked the scroll position would
 * change its own numbering as you read, and the page you land on after clicking
 * "3" would not be the page the nav had been calling 3. The URL is the stable
 * thing, so the nav is about the URL.
 *
 * That also means it renders identically on the server and the client, which is
 * what lets a crawler take the links without executing anything.
 */
export function Pagination({ basePath, currentPage, totalPages, query = {} }: PaginationProps) {
    if (totalPages <= 1) return null

    const href = (page: number) => buildPageHref(basePath, page, query)

    return (
        <nav className='pagination' aria-label='Pagination'>
            {currentPage > 1 && (
                // rel=prev/next are no longer used for indexing, but they still
                // describe the sequence to other consumers and cost nothing.
                <Link className='pagination__step' rel='prev' href={href(currentPage - 1)}>
                    Previous
                </Link>
            )}

            <ol className='pagination__pages'>
                {pageWindow(currentPage, totalPages).map((page, index) => (
                    <li key={page ?? `gap-${index}`} className='pagination__item'>
                        <PageCell page={page} currentPage={currentPage} href={href} />
                    </li>
                ))}
            </ol>

            {currentPage < totalPages && (
                <Link className='pagination__step' rel='next' href={href(currentPage + 1)}>
                    Next
                </Link>
            )}
        </nav>
    )
}
