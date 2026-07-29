import React, { useState } from 'react'
import Link from 'next/link'
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp'
import EditIcon from '@mui/icons-material/Edit'
import SubjectSharpIcon from '@mui/icons-material/SubjectSharp'
import { COMMENTS_ANCHOR } from '../../Comments/CommentsSection'
import { ConfirmDialog } from '../../common/ConfirmDialog'

interface PoemActionsProps {
    poemId: string
    isOwner: boolean
    onEdit: () => void
    onDelete: (event: React.SyntheticEvent) => void
}

export function PoemActions({ poemId, isOwner, onEdit, onDelete }: PoemActionsProps) {
    const [showConfirm, setShowConfirm] = useState(false)

    return (
        <>
            {isOwner && (
                <>
                    <button
                        type='button'
                        className='poem__edit-icon'
                        onClick={onEdit}
                        data-testid='edit-poem'
                        aria-label='Edit poem'
                    >
                        <EditIcon />
                    </button>
                    <button
                        type='button'
                        className='poem__delete-icon'
                        style={{ fill: 'red' }}
                        data-testid='delete-poem'
                        onClick={() => setShowConfirm(true)}
                        aria-label='Delete poem'
                    >
                        <HighlightOffSharpIcon />
                    </button>
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
                </>
            )}
            <Link
                href={`/detail/${poemId}#${COMMENTS_ANCHOR}`}
                className='poem__comments-icon'
                aria-label='View comments'
            >
                <SubjectSharpIcon style={{ fill: '#000' }} />
            </Link>
        </>
    )
}
