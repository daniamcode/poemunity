import { useRef, useState } from 'react'
import API from '../../../redux/actions/axiosInstance'
import { resizeImageToBase64 } from '../../../utils/imageUtils'
import { Context } from '../../../typescript/interfaces'

interface Props {
    context: Context
}

const DEFAULT_PICTURE = 'https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg'

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
            const { data } = await api.patch('/api/users/picture', { picture: base64 })

            window.localStorage.setItem('loggedUser', JSON.stringify(data.token))
            context.setState({ ...context, picture: data.picture })
        } catch {
            setError('Upload failed. Please try again.')
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <div className='profile__picture-wrapper' onClick={handleClick} title='Change profile picture'>
            <img
                className='profile__image'
                src={context?.picture || DEFAULT_PICTURE}
                alt={context?.username}
            />
            <div className='profile__picture-overlay'>
                {uploading
                    ? <span className='profile__picture-spinner' />
                    : <span className='profile__picture-camera'>📷</span>
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
