import Image from 'next/image'

const COLORS = [
    '#5c6bc0', '#26a69a', '#ef5350', '#ab47bc',
    '#42a5f5', '#66bb6a', '#ffa726', '#8d6e63'
]

export function getAvatarColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
}

export function getInitials(name: string) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AuthorAvatarProps {
    name: string
    picture: string
    /**
     * The rendered edge in CSS pixels. Passed to `next/image` so it requests a
     * file of roughly that size instead of the original.
     *
     * This was a raw `<img>` pointed straight at the source file, so a 550x412
     * portrait was downloaded in full to be drawn at 44x44 — 84 KiB for about
     * 1% of its pixels, twice over on the mobile listing, which is where
     * PageSpeed's 258 KiB of "improve image delivery" came from. `next/image`
     * resizes at the edge and negotiates WebP/AVIF, so the same avatar arrives
     * as a few KiB with no change to the source files on S3.
     */
    size?: number
}

const DEFAULT_AVATAR_SIZE = 44

/**
 * Can `next/image` be handed this?
 *
 * It THROWS on a bare relative path — "pic.jpg" without a leading slash — where
 * the plain `<img>` this replaced simply resolved it against the current URL.
 * `picture` comes from the database and is whatever was stored there over the
 * years, so one malformed row would have taken down every list it appeared in.
 * Anything unusable falls through to the initials, which is already the
 * no-picture case and needs no network at all.
 */
function isRenderableSrc(src: string): boolean {
    return /^https?:\/\//.test(src) || src.startsWith('/')
}

export function AuthorAvatar({ name, picture, size = DEFAULT_AVATAR_SIZE }: AuthorAvatarProps) {
    if (picture && isRenderableSrc(picture)) {
        return (
            <Image
                className='poem__picture'
                src={picture}
                alt={name}
                width={size}
                height={size}
                // Explicit rather than left to the default: these are avatars in
                // a long list, and none of them is ever the LCP element.
                loading='lazy'
                onError={e => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const sibling = target.nextElementSibling as HTMLElement
                    if (sibling) sibling.style.display = 'flex'
                }}
            />
        )
    }

    return (
        <span
            className='poem__picture poem__picture--initials'
            style={{ backgroundColor: getAvatarColor(name) }}
            aria-label={name}
        >
            {getInitials(name)}
        </span>
    )
}
