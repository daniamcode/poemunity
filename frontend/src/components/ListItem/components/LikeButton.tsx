import React from 'react'

interface LikeButtonProps {
    isLiked: boolean
    onLike: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
    show: boolean
}

export function LikeButton({ isLiked, onLike, show }: LikeButtonProps) {
    if (!show) {
        return null
    }

    return (
        <a
            className={isLiked ? 'poem__likes-icon' : 'poem__unlikes-icon'}
            onClick={onLike}
            href='#'
            data-testid={isLiked ? 'like-icon' : 'unlike-icon'}
        />
    )
}
