import { PROFILE_SELECT_CATEGORY, PROFILE_SELECT_TITLE_AUTHOR, PROFILE_SELECT_LIKES } from '../../../../data/constants'
import { PoemFormData } from '../../hooks/useProfileForm'

interface AdminFieldsProps {
    poem: PoemFormData
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
}

function AdminFields({ poem, updatePoemField }: AdminFieldsProps) {
    return (
        <>
            <label className='profile__insert-poem-input'>
                Origin
                <select
                    className='profile__insert-poem-input'
                    name='origin'
                    required
                    value={poem.origin}
                    onChange={event => updatePoemField('origin', event.target.value)}
                >
                    <option value=''>{PROFILE_SELECT_CATEGORY}</option>
                    <option value='famous'>Famous</option>
                    <option value='user'>User</option>
                </select>
            </label>
            <label className='profile__insert-poem-input'>
                {PROFILE_SELECT_TITLE_AUTHOR}
                <input
                    className='profile__insert-poem-input'
                    name='author'
                    required
                    value={poem.fakeId}
                    onChange={event => updatePoemField('fakeId', event.target.value)}
                />
            </label>
            <label className='profile__insert-poem-input'>
                {PROFILE_SELECT_LIKES}
                <input
                    className='profile__insert-poem-input'
                    name='likes'
                    value={poem.likes}
                    onChange={event => updatePoemField('likes', event.target.value)}
                />
            </label>
        </>
    )
}

export default AdminFields
