import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

// Same policy the Register form and the backend enforce: 8–128 characters with
// at least one letter and one number.
const PASSWORD_HELP = 'At least 8 characters, including a letter and a number.'

function isValidPassword(password: string): boolean {
    if (password.length < 8 || password.length > 128) {
        return false
    }
    return /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}

const ResetPassword = (): React.JSX.Element => {
    const router = useRouter()
    const token = typeof router.query.token === 'string' ? router.query.token : ''
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const passwordInvalid = password.length > 0 && !isValidPassword(password)
    const mismatch = confirm.length > 0 && password !== confirm
    const isDisabled = loading || !isValidPassword(password) || password !== confirm

    // No token in the URL — nothing to reset against.
    if (!token) {
        return (
            <div className='login-container'>
                <div className='login-card'>
                    <h2>Reset password</h2>
                    <div className='login'>
                        <p className='login__error' role='alert'>
                            This reset link is invalid or has expired.
                        </p>
                        <Link href='/forgot-password'>Request a new link</Link>
                    </div>
                </div>
            </div>
        )
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        // Client-side guard so a mismatch never reaches the server.
        if (!isValidPassword(password)) {
            setError(PASSWORD_HELP)
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        setLoading(true)
        try {
            await API({}, {}).post(API_ENDPOINTS.PASSWORD_RESET, { token, password })
            // No auto-login: send the user to /login with a success indication.
            router.push('/login?reset=success')
        } catch (err: any) {
            const message = err?.response?.data?.error || 'This reset link is invalid or has expired.'
            setError(message)
            setLoading(false)
        }
    }

    return (
        <div className='login-container'>
            <div className='login-card'>
                <h2>Reset password</h2>
                <form className='login' onSubmit={handleSubmit} data-testid='reset-password'>
                    <label>Choose a new password for your account.</label>
                    <div className='login__password'>
                        <input
                            type='password'
                            value={password}
                            name='Password'
                            placeholder='New password'
                            aria-describedby='reset__password-help'
                            onChange={event => {
                                setPassword(event.target.value)
                                setError('')
                            }}
                        />
                        <p
                            id='reset__password-help'
                            className={passwordInvalid ? 'login__help login__help--error' : 'login__help'}
                        >
                            {PASSWORD_HELP}
                        </p>
                    </div>
                    <div className='login__password'>
                        <input
                            type='password'
                            value={confirm}
                            name='ConfirmPassword'
                            placeholder='Confirm new password'
                            onChange={event => {
                                setConfirm(event.target.value)
                                setError('')
                            }}
                        />
                        {mismatch && (
                            <p className='login__error' role='alert'>Passwords do not match.</p>
                        )}
                    </div>
                    {error && <p className='login__error' role='alert'>{error}</p>}
                    <button disabled={isDisabled}>Reset password</button>
                    <Link href='/login'>Back to login</Link>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
