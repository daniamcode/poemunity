import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../../../redux/actions/axiosInstance'
import { CATEGORIES, categoryToSlug } from '../../../data/constants'
import { Context } from '../../../typescript/interfaces'
import { slugify } from '../../../utils/urlUtils'

interface Props {
    context: Context
}

const CURRENT_YEAR = new Date().getFullYear()

function PrivacyToggle({ field, privateFields, onToggle }: {
    field: string
    privateFields: string[]
    onToggle: (f: string) => void
}) {
    const isPrivate = privateFields.includes(field)
    return (
        <button
            type='button'
            className={`privacy-toggle${isPrivate ? ' privacy-toggle--private' : ''}`}
            onClick={() => onToggle(field)}
            title={isPrivate ? 'Hidden from public profile — click to make public' : 'Visible on public profile — click to hide'}
        >
            {isPrivate ? '🔒 Private' : '🌐 Public'}
        </button>
    )
}

export default function UserInfo({ context }: Props) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        bio: context.bio || '',
        preferredGenres: context.preferredGenres || [],
        name: context.name || '',
        surname: context.surname || '',
        city: context.city || '',
        country: context.country || '',
        birthYear: context.birthYear ? String(context.birthYear) : '',
        gender: context.gender || '',
        privateFields: context.privateFields || []
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleEdit = () => {
        setForm({
            bio: context.bio || '',
            preferredGenres: context.preferredGenres || [],
            name: context.name || '',
            surname: context.surname || '',
            city: context.city || '',
            country: context.country || '',
            birthYear: context.birthYear ? String(context.birthYear) : '',
            gender: context.gender || '',
            privateFields: context.privateFields || []
        })
        setEditing(true)
    }

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }))

    const toggleGenre = (genre: string) =>
        setForm(prev => ({
            ...prev,
            preferredGenres: prev.preferredGenres.includes(genre)
                ? prev.preferredGenres.filter(g => g !== genre)
                : [...prev.preferredGenres, genre]
        }))

    const handleCancel = () => { setEditing(false); setError('') }

    const togglePrivacy = (field: string) =>
        setForm(prev => ({
            ...prev,
            privateFields: prev.privateFields.includes(field)
                ? prev.privateFields.filter(f => f !== field)
                : [...prev.privateFields, field]
        }))

    const handleSave = async () => {
        setSaving(true)
        setError('')
        try {
            const payload = {
                bio: form.bio,
                preferredGenres: form.preferredGenres,
                name: form.name,
                surname: form.surname,
                city: form.city,
                country: form.country,
                birthYear: form.birthYear ? parseInt(form.birthYear, 10) : null,
                gender: form.gender,
                privateFields: form.privateFields
            }
            const api = API({}, context.config)
            const { data } = await api.patch('/api/users/profile', payload)

            window.localStorage.setItem('loggedUser', JSON.stringify(data.token))
            const a = data.author
            context.setState({
                ...context,
                bio: a.bio || '',
                preferredGenres: a.preferredGenres || [],
                name: a.name || '',
                surname: a.surname || '',
                city: a.city || '',
                country: a.country || '',
                birthYear: a.birthYear || null,
                gender: a.gender || '',
                privateFields: a.privateFields || []
            })
            setEditing(false)
        } catch {
            setError('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const priv = new Set(context.privateFields || [])
    const displayGenres = context.preferredGenres || []
    const age = context.birthYear ? CURRENT_YEAR - context.birthYear : null

    const locationParts = [
        !priv.has('city') && context.city,
        !priv.has('country') && context.country
    ].filter(Boolean)

    const metaParts = [
        age !== null && !priv.has('birthYear') && `${age} years old`,
        locationParts.length > 0 && locationParts.join(', '),
        !priv.has('gender') && context.gender
    ].filter(Boolean)

    const displaySurname = !priv.has('surname') && context.surname
    const displayName = context.name && context.name !== context.username
        ? `${context.name}${displaySurname ? ` ${displaySurname}` : ''}`
        : displaySurname || null

    return (
        <div className='user-info'>
            <h2 className='user-info__name'>
                {context.username}
                {displayName && <span className='user-info__realname'> · {displayName}</span>}
            </h2>
            <Link to={`/authors/${slugify(context.username || '')}`} className='user-info__public-link'>
                View public profile →
            </Link>

            {editing ? (
                <div className='user-info__form'>

                    <div className='user-info__field-row'>
                        <div className='user-info__field-group'>
                            <div className='user-info__label-row'>
                                <label className='user-info__label'>First name</label>
                            </div>
                            <input className='user-info__input' value={form.name} onChange={set('name')} placeholder='Emily' />
                        </div>
                        <div className='user-info__field-group'>
                            <div className='user-info__label-row'>
                                <label className='user-info__label'>Last name</label>
                                <PrivacyToggle field='surname' privateFields={form.privateFields} onToggle={togglePrivacy} />
                            </div>
                            <input className='user-info__input' value={form.surname} onChange={set('surname')} placeholder='Hart' />
                        </div>
                    </div>

                    <div className='user-info__field-row'>
                        <div className='user-info__field-group'>
                            <div className='user-info__label-row'>
                                <label className='user-info__label'>City</label>
                                <PrivacyToggle field='city' privateFields={form.privateFields} onToggle={togglePrivacy} />
                            </div>
                            <input className='user-info__input' value={form.city} onChange={set('city')} placeholder='San Francisco' />
                        </div>
                        <div className='user-info__field-group'>
                            <div className='user-info__label-row'>
                                <label className='user-info__label'>Country</label>
                                <PrivacyToggle field='country' privateFields={form.privateFields} onToggle={togglePrivacy} />
                            </div>
                            <input className='user-info__input' value={form.country} onChange={set('country')} placeholder='USA' />
                        </div>
                    </div>

                    <div className='user-info__field-row'>
                        <div className='user-info__field-group'>
                            <div className='user-info__label-row'>
                                <label className='user-info__label'>Birth year</label>
                                <PrivacyToggle field='birthYear' privateFields={form.privateFields} onToggle={togglePrivacy} />
                            </div>
                            <input
                                className='user-info__input'
                                type='number'
                                min={1900}
                                max={CURRENT_YEAR}
                                value={form.birthYear}
                                onChange={set('birthYear')}
                                placeholder='1990'
                            />
                        </div>
                        <div className='user-info__field-group'>
                            <div className='user-info__label-row'>
                                <label className='user-info__label'>Gender</label>
                                <PrivacyToggle field='gender' privateFields={form.privateFields} onToggle={togglePrivacy} />
                            </div>
                            <input className='user-info__input' value={form.gender} onChange={set('gender')} placeholder='e.g. She/Her, He/Him, They/Them…' />
                        </div>
                    </div>

                    <label className='user-info__label'>About me</label>
                    <textarea
                        className='user-info__textarea'
                        value={form.bio}
                        onChange={set('bio')}
                        placeholder='Tell the community about yourself and your poetry...'
                        rows={4}
                        maxLength={500}
                    />

                    <label className='user-info__label'>
                        Preferred genres
                        {form.preferredGenres.length > 0 && (
                            <span className='user-info__hint'> ({form.preferredGenres.length} selected)</span>
                        )}
                    </label>
                    <div className='user-info__genre-picker'>
                        {CATEGORIES.map(genre => (
                            <button
                                key={genre}
                                type='button'
                                className={`user-info__genre-option${form.preferredGenres.includes(genre) ? ' user-info__genre-option--selected' : ''}`}
                                onClick={() => toggleGenre(genre)}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>

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
                    {metaParts.length > 0 && (
                        <p className='user-info__meta'>{metaParts.join(' · ')}</p>
                    )}

                    {context.bio ? (
                        <p className='user-info__bio'>{context.bio}</p>
                    ) : (
                        <p className='user-info__bio user-info__bio--empty'>No bio yet.</p>
                    )}

                    {displayGenres.length > 0 && (
                        <div className='user-info__genres'>
                            {displayGenres.map(genre => (
                                <Link key={genre} to={`/${categoryToSlug(genre)}`} className='user-info__genre-tag'>
                                    {genre}
                                </Link>
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
