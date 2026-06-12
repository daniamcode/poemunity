import React, { useRef, useState } from 'react'
import API from '../../../redux/actions/axiosInstance'
import { resizeImageToBase64 } from '../../../utils/imageUtils'
import { Context } from '../../../typescript/interfaces'
import { getAvatarColor, getInitials } from '../../ListItem/components/AuthorAvatar'

interface Props {
    context: Context
}

export default function ProfilePicture({ context }: Props) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
        if (!uploading) inputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError('')
        setUploading(true)

        try {
            const base64 = await resizeImageToBase64(file, 200)

            const api = API({}, context.config)
            const { data } = await api.patch('/api/v1/users/picture', { picture: base64 })

            context.setState({ ...context, picture: data.picture })
        } catch {
            setError('Upload failed. Please try again.')
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    const username = context?.username || '?'

    return (
        <div className='profile__picture-wrapper' onClick={handleClick}>
            {context?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    className='profile__image'
                    src={context.picture}
                    alt={username}
                />
            ) : (
                <div
                    className='profile__image profile__image--initials'
                    style={{ backgroundColor: getAvatarColor(username) }}
                    aria-label={username}
                >
                    {getInitials(username)}
                </div>
            )}
            <div className='profile__picture-overlay'>
                {uploading
                    ? <span className='profile__picture-spinner' />
                    : <>
                        <span className='profile__picture-camera'>📷</span>
                        <span className='profile__picture-label'>Change photo</span>
                    </>
                }
            </div>
            <input
                ref={inputRef}
                type='file'
                accept='image/*'
                className='profile__picture-input'
                onChange={handleFileChange}
            />
            {error && <p className='profile__picture-error'>{error}</p>}
        </div>
    )
}
