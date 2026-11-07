import Link from 'next/link'
import { AI_DISCLOSURE_HREF, AI_BADGE_LABEL, AI_BADGE_TITLE } from '../../data/constants'

interface AiBadgeProps {
    /** Author type as stored on the Author record. The badge renders only for 'ai'. */
    authorType?: string | null
    /**
     * Where the disclosure opens. Set to `'_blank'` by the EMBED card only:
     * that card renders inside a 420px frame on a third party's page, so a
     * normal navigation would strand the reader inside the frame with no way
     * back. It stays unset everywhere on poemunity.com, where the terms page
     * belongs in the same tab like any other internal link.
     *
     * The badge itself is never suppressed for either value — a disclosure that
     * depends on how the reader arrived is not a disclosure.
     */
    target?: '_blank'
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
export function AiBadge({ authorType, target }: AiBadgeProps) {
    if (authorType !== 'ai') return null

    return (
        <Link href={AI_DISCLOSURE_HREF} className='ai-badge' title={AI_BADGE_TITLE} target={target}>
            {AI_BADGE_LABEL}
        </Link>
    )
}

export default AiBadge
