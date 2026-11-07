import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Poem } from '../../../typescript/interfaces'
import { SITE_URL } from '../../../lib/siteUrl'

type Mode = 'embed' | 'link'

interface EmbedDialogProps {
    open: boolean
    poem: Poem
    onClose: () => void
}

/** A poem resolves by both id and slug; the sitemap emits slugs. */
function poemSlug(poem: Poem): string {
    return poem.slug || poem.id
}

/**
 * The iframe snippet someone pastes into their own page.
 *
 * The `title` attribute is escaped for `"`, which is not defensive paranoia:
 * a poem title containing a quotation mark would otherwise terminate the
 * attribute early, and the pasted markup would ship a mangled title — or an
 * extra attribute — onto somebody else's site. Titles are free text and poems
 * quote constantly.
 */
function buildIframeSnippet(poem: Poem): string {
    const title = `${poem.title} by ${poem.author} — Poemunity`.replace(/"/g, '&quot;')
    return (
        `<iframe src="${SITE_URL}/embed/${poemSlug(poem)}" ` +
        `width="420" height="360" style="border:0;max-width:100%" ` +
        `loading="lazy" title="${title}"></iframe>`
    )
}

function buildLink(poem: Poem): string {
    return `${SITE_URL}/detail/${poemSlug(poem)}`
}

/**
 * Copy control for the embed — the button is the last thing standing between a
 * reader and a backlink, so it gets both snippet formats.
 *
 * Two modes, because they fail in different places. The **iframe** is the real
 * embed — styled, framed, and carrying its own attribution — but Reddit, Stack
 * Overflow and Hacker News block iframes outright, and those are exactly where
 * a poem is most likely to be shared. The **link** is a plain anchor that works
 * anywhere, including plain-text forums and markdown. Offering only one of them
 * means the feature is broken at its two most likely destinations.
 *
 * Reuses `.poem__confirm-overlay` rather than introducing a second modal: the
 * dimmer, the centreing, the z-index and the Escape/portal behaviour are one
 * concern and this is the second caller of it, not a new pattern.
 */
export function EmbedDialog({ open, poem, onClose }: EmbedDialogProps) {
    const [mode, setMode] = useState<Mode>('embed')
    const [status, setStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
    const textRef = useRef<HTMLTextAreaElement>(null)

    const snippet = mode === 'embed' ? buildIframeSnippet(poem) : buildLink(poem)

    // A fresh dialog opens on the primary format with no stale "Copied" from
    // the last poem.
    useEffect(() => {
        if (!open) return
        setMode('embed')
        setStatus('idle')
    }, [open])

    // Escape closes. Portalled, so there is no ancestor key handler to lean on.
    useEffect(() => {
        if (!open) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [open, onClose])

    const copy = useCallback(async () => {
        // The async Clipboard API needs a secure context. It is absent on plain
        // http, and it rejects rather than throwing when the document is not
        // focused — so both are caught rather than assumed to work.
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(snippet)
                setStatus('copied')
                return
            } catch {
                // fall through to the legacy path
            }
        }

        const element = textRef.current
        if (element) {
            element.focus()
            element.select()
            element.setSelectionRange(0, snippet.length)
            let ok = false
            try {
                ok = document.execCommand('copy')
            } catch {
                ok = false
            }
            // When even that fails the text is at least selected, so say so —
            // a Copy button that silently does nothing is worse than one that
            // tells you to do it by hand.
            setStatus(ok ? 'copied' : 'manual')
        }
    }, [snippet])

    if (!open || typeof document === 'undefined') {
        return null
    }

    return createPortal(
        <div
            className='poem__confirm-overlay'
            role='dialog'
            aria-modal='true'
            aria-labelledby='embed-dialog-title'
            onClick={onClose}
        >
            <div className='embed-dialog' onClick={event => event.stopPropagation()}>
                <p className='poem__confirm-title' id='embed-dialog-title'>Share this poem</p>

                <div className='embed-dialog__tabs'>
                    <button
                        type='button'
                        className='embed-dialog__tab'
                        aria-pressed={mode === 'embed'}
                        onClick={() => { setMode('embed'); setStatus('idle') }}
                    >
                        Embed
                    </button>
                    <button
                        type='button'
                        className='embed-dialog__tab'
                        aria-pressed={mode === 'link'}
                        onClick={() => { setMode('link'); setStatus('idle') }}
                    >
                        Link
                    </button>
                </div>

                <label className='embed-dialog__label' htmlFor='embed-snippet'>
                    {mode === 'embed' ? 'Paste this into your site' : 'Link to the poem'}
                </label>
                <textarea
                    id='embed-snippet'
                    ref={textRef}
                    className='embed-dialog__snippet'
                    readOnly
                    rows={mode === 'embed' ? 4 : 2}
                    value={snippet}
                    data-testid='embed-snippet'
                    // Selecting on focus is what makes the fallback in `copy()`
                    // work, and it is also what a manual ⌘C needs.
                    onFocus={event => event.currentTarget.select()}
                />

                <p className='embed-dialog__hint' role='status'>
                    {mode === 'embed'
                        ? 'The embed carries a link back to Poemunity wherever it is pasted.'
                        : 'For sites that block embeds — Reddit, forums, plain-text posts.'}
                </p>

                <div className='poem__confirm-actions'>
                    <button
                        type='button'
                        className='embed-dialog__copy'
                        onClick={copy}
                        data-testid='embed-copy'
                    >
                        {status === 'copied' ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        type='button'
                        className='poem__confirm-cancel'
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                {status === 'manual' && (
                    <p className='embed-dialog__manual' role='alert'>
                        Press <kbd>⌘C</kbd> / <kbd>Ctrl+C</kbd> to copy the selected text.
                    </p>
                )}
            </div>
        </div>,
        document.body
    )
}

export default EmbedDialog
