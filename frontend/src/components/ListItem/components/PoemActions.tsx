import React, { useState } from 'react'
import Link from 'next/link'
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp'
import EditIcon from '@mui/icons-material/Edit'
import SubjectSharpIcon from '@mui/icons-material/SubjectSharp'

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
                    <EditIcon className='poem__edit-icon' onClick={onEdit} data-testid='edit-poem' />
                    <HighlightOffSharpIcon
                        className='poem__delete-icon'
                        style={{ fill: 'red' }}
                        data-testid='delete-poem'
                        onClick={() => setShowConfirm(true)}
                    />
                    {showConfirm && (
                        <div
                            className='poem__confirm-overlay'
                            role='dialog'
                            aria-modal='true'
                            aria-labelledby='poem-confirm-title'
                        >
                            <div className='poem__confirm-box'>
                                <p className='poem__confirm-title' id='poem-confirm-title'>Delete this poem?</p>
                                <p className='poem__confirm-message'>This action cannot be undone.</p>
                                <div className='poem__confirm-actions'>
                                    <button
                                        className='poem__confirm-cancel'
                                        onClick={() => setShowConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className='poem__confirm-delete'
                                        onClick={e => {
                                            setShowConfirm(false)
                                            onDelete(e)
                                        }}
                                        data-testid='confirm-delete-poem'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            <Link href={`/detail/${poemId}`} className='poem__comments-icon'>
                <SubjectSharpIcon style={{ fill: '#000' }} />
            </Link>
        </>
    )
}
