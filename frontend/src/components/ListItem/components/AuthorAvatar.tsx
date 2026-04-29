const COLORS = [
    '#5c6bc0', '#26a69a', '#ef5350', '#ab47bc',
    '#42a5f5', '#66bb6a', '#ffa726', '#8d6e63'
]

function getColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AuthorAvatarProps {
    name: string
    picture: string
}

export function AuthorAvatar({ name, picture }: AuthorAvatarProps) {
    if (picture) {
        return (
            <img
                className='poem__picture'
                src={picture}
                alt={name}
                onError={e => {
                    const target = e.currentTarget
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
            style={{ backgroundColor: getColor(name) }}
            aria-label={name}
        >
            {getInitials(name)}
        </span>
    )
}
