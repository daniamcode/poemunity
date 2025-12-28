import React from 'react'
import { PROFILE_SEND_POEM, PROFILE_RESET_POEM, PROFILE_CANCEL_EDIT } from '../../../../data/constants'
import { PoemFormData } from '../../hooks/useProfileForm'

interface FormButtonsProps {
    context: any
    poem: PoemFormData
    isEditing: boolean
    handleReset: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleSend: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleCancel: (event: React.MouseEvent<HTMLButtonElement>) => void
}

function FormButtons({ context, poem, isEditing, handleReset, handleSend, handleCancel }: FormButtonsProps) {
    const isDisabled =
        !poem.title || !poem.category || !poem.content || (context?.userId === context.adminId && !poem.origin)

    return (
        <>
            <button className='profile__send-poem' type='submit' onClick={handleReset}>
                {PROFILE_RESET_POEM}
            </button>
            {isEditing && (
                <button className='profile__cancel-edit' type='button' onClick={handleCancel}>
                    {PROFILE_CANCEL_EDIT}
                </button>
            )}
            <button className='profile__send-poem' type='submit' onClick={handleSend} disabled={isDisabled}>
                {PROFILE_SEND_POEM}
            </button>
        </>
    )
}

export default FormButtons
