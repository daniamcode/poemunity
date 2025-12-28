import React from 'react'
import { Link } from 'react-router-dom'

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
        <Link
            className={isLiked ? 'poem__likes-icon' : 'poem__unlikes-icon'}
            onClick={onLike}
            to='#'
            data-testid={isLiked ? 'like-icon' : 'unlike-icon'}
        />
    )
}
