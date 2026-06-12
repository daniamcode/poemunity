import React from 'react'

interface LikeButtonProps {
    isLiked: boolean
    onLike: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    show: boolean
}

export function LikeButton({ isLiked, onLike, show }: LikeButtonProps) {
    if (!show) {
        return null
    }

    return (
        <button
            type='button'
            className={isLiked ? 'poem__likes-icon' : 'poem__unlikes-icon'}
            onClick={onLike}
            aria-label={isLiked ? 'Unlike poem' : 'Like poem'}
            data-testid={isLiked ? 'like-icon' : 'unlike-icon'}
        />
    )
}
