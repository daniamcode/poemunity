import Link from 'next/link'
import { AI_DISCLOSURE_HREF, AI_BADGE_LABEL, AI_BADGE_TITLE } from '../../data/constants'

interface AiBadgeProps {
    /** Author type as stored on the Author record. The badge renders only for 'ai'. */
    authorType?: string | null
}

/**
 * Marks AI-assisted content where it appears.
 *
 * The site-wide disclosure lives in the footer, which is unreachable on the
 * views that infinitely scroll — precisely the views full of this content. A
 * badge attached to the poem or comment itself is visible at any scroll depth
 * and on any viewport, and it links back to the full explanation.
 *
 * Renders nothing for human authors, so it is safe to drop in unconditionally.
 */
export function AiBadge({ authorType }: AiBadgeProps) {
    if (authorType !== 'ai') return null

    return (
        <Link href={AI_DISCLOSURE_HREF} className='ai-badge' title={AI_BADGE_TITLE}>
            {AI_BADGE_LABEL}
        </Link>
    )
}

export default AiBadge
