import { useState } from 'react'
import API from '../../../redux/actions/axiosInstance'
import { Context } from '../../../typescript/interfaces'

interface Props {
    context: Context
}

export default function UserInfo({ context }: Props) {
    const [editing, setEditing] = useState(false)
    const [bio, setBio] = useState(context.bio || '')
    const [genresInput, setGenresInput] = useState((context.preferredGenres || []).join(', '))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleEdit = () => {
        setBio(context.bio || '')
        setGenresInput((context.preferredGenres || []).join(', '))
        setEditing(true)
    }

    const handleCancel = () => {
        setEditing(false)
        setError('')
    }

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const preferredGenres = genresInput
                .split(',')
                .map(g => g.trim())
                .filter(Boolean)

            const api = API({}, context.config)
            const { data } = await api.patch('/api/users/profile', { bio, preferredGenres })

            window.localStorage.setItem('loggedUser', JSON.stringify(data.token))
            context.setState({ ...context, bio: data.bio || '', preferredGenres: data.preferredGenres || [] })
            setEditing(false)
        } catch {
            setError('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const displayGenres = context.preferredGenres || []

    return (
        <div className='user-info'>
            <h2 className='user-info__name'>{context.username}</h2>

            {editing ? (
                <div className='user-info__form'>
                    <label className='user-info__label'>About me</label>
                    <textarea
                        className='user-info__textarea'
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder='Tell the community about yourself and your poetry...'
                        rows={4}
                        maxLength={500}
                    />

                    <label className='user-info__label'>Preferred genres <span className='user-info__hint'>(comma-separated)</span></label>
                    <input
                        className='user-info__input'
                        type='text'
                        value={genresInput}
                        onChange={e => setGenresInput(e.target.value)}
                        placeholder='e.g. Love, Nature, Nostalgia'
                    />

                    {error && <p className='user-info__error'>{error}</p>}

                    <div className='user-info__actions'>
                        <button className='user-info__btn user-info__btn--save' onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button className='user-info__btn user-info__btn--cancel' onClick={handleCancel} disabled={saving}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className='user-info__view'>
                    {context.bio ? (
                        <p className='user-info__bio'>{context.bio}</p>
                    ) : (
                        <p className='user-info__bio user-info__bio--empty'>No bio yet.</p>
                    )}

                    {displayGenres.length > 0 && (
                        <div className='user-info__genres'>
                            {displayGenres.map(genre => (
                                <span key={genre} className='user-info__genre-tag'>{genre}</span>
                            ))}
                        </div>
                    )}

                    <button className='user-info__btn user-info__btn--edit' onClick={handleEdit}>
                        Edit profile
                    </button>
                </div>
            )}
        </div>
    )
}
