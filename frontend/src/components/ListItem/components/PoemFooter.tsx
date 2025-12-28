import React from 'react'
import { LIKE, LIKES } from '../../../data/constants'
import { LikeButton } from './LikeButton'
import { PoemActions } from './PoemActions'

interface PoemFooterProps {
    poemId: string
    likesCount: number
    isLiked: boolean
    showLikeButton: boolean
    isOwner: boolean
    onLike: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
    onEdit: () => void
    onDelete: (event: React.SyntheticEvent) => void
}

export function PoemFooter({
    poemId,
    likesCount,
    isLiked,
    showLikeButton,
    isOwner,
    onLike,
    onEdit,
    onDelete
}: PoemFooterProps) {
    return (
        <section className='poem__footer'>
            <div className='poem__likes'>
                {likesCount} {likesCount === 1 ? LIKE : LIKES}
            </div>
            <div className='separator' />
            <LikeButton isLiked={isLiked} onLike={onLike} show={showLikeButton} />
            <PoemActions poemId={poemId} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} />
        </section>
    )
}
