import { useEffect, useState } from 'react'
import { PROFILE_SELECT_CATEGORY, PROFILE_SELECT_LIKES } from '../../../../data/constants'
import { PoemFormData } from '../../hooks/useProfileForm'
import { Author } from '../../../../typescript/interfaces'

interface AdminFieldsProps {
    poem: PoemFormData
    updatePoemField: <K extends keyof PoemFormData>(field: K, value: PoemFormData[K]) => void
}

function AdminFields({ poem, updatePoemField }: AdminFieldsProps) {
    const [fakeAuthors, setFakeAuthors] = useState<Author[]>([])

    useEffect(() => {
        fetch('/api/v1/authors?type=human&fake=true&limit=100')
            .then(r => r.json())
            .then((data: Author[]) => setFakeAuthors(data.sort((a, b) => a.name.localeCompare(b.name))))
            .catch(() => {})
    }, [])

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
                    <option value='user'>Human</option>
                    <option value='ai'>AI</option>
                </select>
            </label>
            <label className='profile__insert-poem-input'>
                Author
                <select
                    className='profile__insert-poem-input'
                    name='author'
                    value={poem.fakeId}
                    onChange={event => updatePoemField('fakeId', event.target.value)}
                >
                    <option value=''>— post as yourself —</option>
                    {fakeAuthors.map(author => (
                        <option key={author.id} value={author.id}>
                            {author.name}
                        </option>
                    ))}
                </select>
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
