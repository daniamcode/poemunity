import Link from 'next/link'
import { Poem } from '../../typescript/interfaces'
import { AiBadge } from '../common/AiBadge'
import { slugify } from '../../utils/urlUtils'
import { SITE_URL } from '../../lib/siteUrl'

interface EmbedPoemProps {
    poem: Poem
}

/**
 * THE POEM AS IT APPEARS ON SOMEONE ELSE'S WEBSITE.
 *
 * This card is the entire point of the embed feature: it is copied onto
 * third-party pages, and every copy carries `<a href="https://poemunity.com">`
 * with it. No outreach, no account, nothing to repeat — the link travels with
 * the content, which is how YouTube, Spotify and WordPress.com got links at
 * scale.
 *
 * Three rules that are load-bearing rather than stylistic:
 *
 * 1. **Every link opens in a NEW TAB** (`target="_blank"`). This renders inside
 *    a 420px iframe, so a normal navigation would strand the reader in a frame
 *    they cannot escape — and the host page would see the click and lose the
 *    visitor.
 *
 * 2. **The attribution link is PINNED to the bottom**, not placed after the
 *    poem. Poems are unbounded; put the link below one and a reader who never
 *    scrolls never sees it, which is the only moment the embed earns anything.
 *    So the layout is `head (fixed) / body (scrolls) / foot (fixed)`.
 *
 * 3. **The AI badge rides on the byline**, same as every other surface that
 *    names an author. A disclosure that depends on how the reader arrived is
 *    not a disclosure, and this is a surface that never touches poemunity.com.
 *
 * Rendered server-side — the whole card is in the HTML before hydration.
 */
export function EmbedPoem({ poem }: EmbedPoemProps) {
    const authorSlug = poem.authorSlug || slugify(poem.author)
    // Canonicalise to the slug for the same reason the detail page does: a poem
    // resolves by both id and slug, and the sitemap emits slugs.
    const poemSlug = poem.slug || poem.id
    const poemUrl = `${SITE_URL}/detail/${poemSlug}`

    return (
        <article className='embed' data-testid='embed-card'>
            <header className='embed__head'>
                <h1 className='embed__title'>{poem.title}</h1>
                <p className='embed__byline'>
                    <Link
                        href={`${SITE_URL}/authors/${authorSlug}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='embed__author'
                    >
                        {poem.author}
                    </Link>
                    <AiBadge authorType={poem.authorType} target='_blank' />
                </p>
            </header>

            <div className='embed__body'>
                {/* The whole poem, not an extract. It scrolls inside the frame
                    while the header and the attribution stay put. */}
                <div className='embed__poem'>{poem.poem}</div>
            </div>

            {/* Pinned. This anchor is the product — see rule 2 above. */}
            <footer className='embed__foot'>
                <Link
                    href={poemUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='embed__cta'
                    data-testid='embed-attribution'
                >
                    Read the full poem on <span className='embed__cta-brand'>Poemunity</span>
                    <span className='embed__cta-arrow' aria-hidden='true'> →</span>
                </Link>
            </footer>
        </article>
    )
}

export default EmbedPoem
