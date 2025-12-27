import React from 'react'
import { PROFILE_SUBTITLE_CREATE, PROFILE_SUBTITLE_UPDATE } from '../../../data/constants'
import AdminFields from './form/AdminFields'
import PoemInputFields from './form/PoemInputFields'
import PoemTextArea from './form/PoemTextArea'
import FormButtons from './form/FormButtons'
import { PoemFormData } from '../hooks/useProfileForm'

interface ProfileFormProps {
    context: any
    poem: PoemFormData
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
    poemQuery: any
    handleSend: (event: React.MouseEvent<HTMLButtonElement>) => void
    handleReset: (event: React.MouseEvent<HTMLButtonElement>) => void
}

function ProfileForm({ context, poem, updatePoemField, poemQuery, handleSend, handleReset }: ProfileFormProps) {
    const isAdmin = context?.userId === context.adminId

    return (
        <div className='profile__personal-data'>
            <div className='profile__insert-poem'>
                <p className='profile__insert-poem-title'>
                    {context?.elementToEdit ? PROFILE_SUBTITLE_UPDATE : PROFILE_SUBTITLE_CREATE}
                </p>
                <form className='profile__insert-poem-form'>
                    <div className='profile__insert-poem-inputs'>
                        {isAdmin && <AdminFields poem={poem} updatePoemField={updatePoemField} />}
                        <PoemInputFields poem={poem} poemQuery={poemQuery} updatePoemField={updatePoemField} />
                    </div>
                    <PoemTextArea poem={poem} updatePoemField={updatePoemField} />
                    <FormButtons context={context} poem={poem} handleReset={handleReset} handleSend={handleSend} />
                </form>
            </div>
        </div>
    )
}

export default ProfileForm
