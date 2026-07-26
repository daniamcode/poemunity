import React, { useState } from 'react'
import Link from 'next/link'
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp'
import EditIcon from '@mui/icons-material/Edit'
import SubjectSharpIcon from '@mui/icons-material/SubjectSharp'
import { LIKE, LIKES } from '../../../data/constants'
import { Poem, Context } from '../../../typescript/interfaces'
import { ConfirmDialog } from '../../common/ConfirmDialog'

interface PoemFooterProps {
    poem: Poem
    context: Context
    onLike: (event: React.SyntheticEvent) => void
    onDelete: (event: React.SyntheticEvent) => void
    onEdit: () => void
}

export function PoemFooter({ poem, context, onLike, onDelete, onEdit }: PoemFooterProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const isUserLiked = poem.likes.some(id => id === context.userId)
    const isOwner = poem.userId === context.userId || context.isAdmin
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
                <button
                    type='button'
                    className='poem__likes-icon'
                    onClick={onLike}
                    data-testid='like-icon'
                    aria-label='Unlike poem'
                />
            )}

            {canLike && !isUserLiked && (
                <button
                    type='button'
                    className='poem__unlikes-icon'
                    onClick={onLike}
                    data-testid='unlike-icon'
                    aria-label='Like poem'
                />
            )}

            {context.user && isOwner && (
                <button
                    type='button'
                    className='poem__edit-icon'
                    onClick={onEdit}
                    data-testid='edit-icon'
                    aria-label='Edit poem'
                >
                    <EditIcon />
                </button>
            )}

            {context.user && isOwner && (
                <button
                    type='button'
                    className='poem__delete-icon'
                    style={{
                        fill: 'red'
                    }}
                    onClick={() => setShowConfirm(true)}
                    data-testid='delete-icon'
                    aria-label='Delete poem'
                >
                    <HighlightOffSharpIcon />
                </button>
            )}

            <ConfirmDialog
                open={showConfirm}
                title='Delete this poem?'
                message='This action cannot be undone.'
                onCancel={() => setShowConfirm(false)}
                onConfirm={e => {
                    setShowConfirm(false)
                    onDelete(e)
                }}
            />

            <Link href={`/detail/${poem.id}`} className='poem__comments-icon' aria-label='View comments'>
                <SubjectSharpIcon
                    style={{
                        fill: '#000'
                    }}
                />
            </Link>
        </section>
    )
}
