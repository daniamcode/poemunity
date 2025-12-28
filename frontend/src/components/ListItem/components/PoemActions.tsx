import React from 'react'
import { Link } from 'react-router-dom'
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
    return (
        <>
            {isOwner && (
                <>
                    <EditIcon className='poem__edit-icon' onClick={onEdit} data-testid='edit-poem' />
                    <HighlightOffSharpIcon
                        className='poem__delete-icon'
                        style={{
                            fill: 'red'
                        }}
                        data-testid='delete-poem'
                        onClick={onDelete}
                    />
                </>
            )}
            <Link to={`/detail/${poemId}`} className='poem__comments-icon'>
                <SubjectSharpIcon
                    style={{
                        fill: '#000'
                    }}
                />
            </Link>
        </>
    )
}
