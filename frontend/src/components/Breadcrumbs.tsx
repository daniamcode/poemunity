import Link from 'next/link'
import { JsonLd } from './JsonLd'
import { breadcrumbStructuredData, Crumb } from '../utils/structuredData'

interface BreadcrumbsProps {
    crumbs: Crumb[]
    baseUrl: string
}

/**
 * The trail to this page, rendered AND marked up.
 *
 * Deliberately both. Emitting BreadcrumbList without showing a trail is common
 * and Google tolerates it, but it contradicts the rule the rest of this site's
 * structured data follows — describe what the page actually shows — and it is
 * the rule that keeps the AI-authorship markup honest. So the trail is visible,
 * and the markup mirrors it exactly, down to the last crumb not being a link.
 */
export function Breadcrumbs({ crumbs, baseUrl }: BreadcrumbsProps) {
    if (crumbs.length < 2) return null

    return (
        <>
            <JsonLd id='breadcrumbs' data={breadcrumbStructuredData(crumbs, baseUrl)} />
            <nav className='breadcrumbs' aria-label='Breadcrumb'>
                <ol className='breadcrumbs__list'>
                    {crumbs.map((crumb, index) => {
                        const isCurrent = index === crumbs.length - 1
                        return (
                            <li key={`${crumb.name}-${index}`} className='breadcrumbs__item'>
                                {isCurrent || !crumb.path ? (
                                    // aria-current marks where you are; without it the
                                    // trail reads as a list of links with no "you are here".
                                    <span aria-current='page'>{crumb.name}</span>
                                ) : (
                                    <Link href={crumb.path} className='breadcrumbs__link'>
                                        {crumb.name}
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </nav>
        </>
    )
}

export default Breadcrumbs
