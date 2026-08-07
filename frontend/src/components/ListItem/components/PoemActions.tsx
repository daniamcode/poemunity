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
    /** Named in each control's accessible name — see the note below. */
    title?: string
    onEdit: () => void
    onDelete: (event: React.SyntheticEvent) => void
}

export function PoemActions({ poemId, isOwner, title, onEdit, onDelete }: PoemActionsProps) {
    const [showConfirm, setShowConfirm] = useState(false)

    // WHICH POEM. These controls are icon-only, so `aria-label` IS the whole
    // accessible name — and a list page renders ten cards, which meant ten
    // identical "View comments" links with nothing to tell them apart when a
    // screen reader lists the links on the page. Lighthouse does not flag these
    // (an aria-label counts as descriptive text, so the audit passes); it is
    // the same defect as the "Read more" links it did flag.
    const about = (action: string) => (title ? `${action} — “${title}”` : action)

    return (
        <>
            {isOwner && (
                <>
                    <button
                        type='button'
                        className='poem__edit-icon'
                        onClick={onEdit}
                        data-testid='edit-poem'
                        aria-label={about('Edit poem')}
                    >
                        <EditIcon />
                    </button>
                    <button
                        type='button'
                        className='poem__delete-icon'
                        style={{ fill: 'red' }}
                        data-testid='delete-poem'
                        onClick={() => setShowConfirm(true)}
                        aria-label={about('Delete poem')}
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
                aria-label={about('View comments')}
            >
                <SubjectSharpIcon style={{ fill: '#000' }} />
            </Link>
        </>
    )
}
