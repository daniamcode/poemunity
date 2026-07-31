import React from 'react'
import {
    PROFILE_SEND_POEM,
    PROFILE_RESET_POEM,
    PROFILE_CANCEL_EDIT,
    PROFILE_SAVE_DRAFT
} from '../../../../data/constants'
import { PoemFormData } from '../../hooks/useProfileForm'

interface FormButtonsProps {
    context: any
    poem: PoemFormData
    isEditing: boolean
    handleReset: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleSend: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleSaveDraft: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => void
}

function FormButtons({
    context,
    poem,
    isEditing,
    handleReset,
    handleSend,
    handleSaveDraft,
    handleCancel
}: FormButtonsProps) {
    const isDisabled =
        !poem.title || !poem.category || !poem.content || (context?.isAdmin && !poem.origin)

    return (
        <div className='profile__form-buttons'>
            <button className='profile__send-poem profile__reset-btn' type='submit' onClick={handleReset}>
                {PROFILE_RESET_POEM}
            </button>
            {isEditing && (
                <button className='profile__cancel-edit' type='button' onClick={handleCancel}>
                    {PROFILE_CANCEL_EDIT}
                </button>
            )}
            {/* Same completeness gate as publishing: a draft is still a poem
                record, and half a form saved is a row the poet has to finish
                before they can do anything with it. */}
            <button
                className='profile__send-poem profile__draft-btn'
                type='button'
                onClick={handleSaveDraft}
                disabled={isDisabled}
            >
                {PROFILE_SAVE_DRAFT}
            </button>
            <button className='profile__send-poem' type='submit' onClick={handleSend} disabled={isDisabled}>
                {PROFILE_SEND_POEM}
            </button>
        </div>
    )
}

export default FormButtons
