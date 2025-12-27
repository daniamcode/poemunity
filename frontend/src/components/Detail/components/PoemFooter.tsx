import React from 'react'
import { Link } from 'react-router-dom'
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp'
import EditIcon from '@mui/icons-material/Edit'
import SubjectSharpIcon from '@mui/icons-material/SubjectSharp'
import { LIKE, LIKES } from '../../../data/constants'
import { Poem, Context } from '../../../typescript/interfaces'

interface PoemFooterProps {
    poem: Poem
    context: Context
    onLike: (event: React.SyntheticEvent) => void
    onDelete: (event: React.SyntheticEvent) => void
    onEdit: () => void
}

export function PoemFooter({ poem, context, onLike, onDelete, onEdit }: PoemFooterProps) {
    const isUserLiked = poem.likes.some(id => id === context.userId)
    const isOwner = poem.userId === context.userId || context.userId === context.adminId
    const canLike = context.user && poem.userId !== context.userId

    return (
        <section className='poem__footer'>
            {poem.likes.length === 1 && (
                <div className='poem__likes'>
                    {poem.likes.length} {LIKE}
                </div>
            )}
            {poem.likes.length !== 1 && (
                <div className='poem__likes'>
                    {poem.likes.length} {LIKES}
                </div>
            )}
            <div className='separator' />

            {canLike && isUserLiked && (
                <div className='poem__likes-icon' onClick={onLike} data-testid='like-icon'></div>
            )}

            {canLike && !isUserLiked && (
                <div className='poem__unlikes-icon' onClick={onLike} data-testid='unlike-icon'></div>
            )}

            {context.user && isOwner && (
                <EditIcon className='poem__edit-icon' onClick={onEdit} data-testid='edit-icon' />
            )}

            {context.user && isOwner && (
                <HighlightOffSharpIcon
                    className='poem__delete-icon'
                    style={{
                        fill: 'red'
                    }}
                    onClick={onDelete}
                    data-testid='delete-icon'
                />
            )}

            <Link to={`/detail/${poem.id}`} className='poem__comments-icon'>
                <SubjectSharpIcon
                    style={{
                        fill: '#000'
                    }}
                />
            </Link>
        </section>
    )
}
