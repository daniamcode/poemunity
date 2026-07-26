import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { registerAction } from '../../redux/actions/loginActions'
import { useAppDispatch } from '../../redux/store'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MESSAGE = 'Password must be 8–128 characters and include a letter and a number.'

function isValidPassword(password: string): boolean {
    if (password.length < 8 || password.length > 128) {
        return false
    }
    return /[a-zA-Z]/.test(password) && /[0-9]/.test(password)
}

function validate(username: string, email: string, password: string): string | null {
    if (username.length > 0 && (username.length < 3 || username.length > 30)) {
        return 'Username must be between 3 and 30 characters.'
    }
    if (email.length > 0 && !EMAIL_REGEX.test(email)) {
        return 'Please enter a valid email address.'
    }
    if (password.length > 0 && !isValidPassword(password)) {
        return PASSWORD_MESSAGE
    }
    return null
}

const Register: React.FC = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [usernameTaken, setUsernameTaken] = useState(false)
    const [emailTaken, setEmailTaken] = useState(false)
    const router = useRouter()
    const dispatch = useAppDispatch()

    const inlineError = validate(username, email, password)
    // Username/email format feedback is shown as a message; the password rule is
    // surfaced by the always-visible helper below, so it is excluded here.
    const fieldError = validate(username, email, '')
    const isEmpty = !username || !email || !password
    const isDisabled = isEmpty || !!inlineError
    const passwordInvalid = password.length > 0 && !isValidPassword(password)

    // Best-effort availability check for the username. The server 409 remains the
    // source of truth; a network error never blocks the user from submitting.
    useEffect(() => {
        setUsernameTaken(false)
        const value = username.trim()
        if (value.length < 3 || value.length > 30) {
            return
        }
        let cancelled = false
        const timer = setTimeout(() => {
            API({}, {})
                .get(`${API_ENDPOINTS.REGISTER_AVAILABILITY}?username=${encodeURIComponent(value)}`)
                .then(response => {
                    if (!cancelled && response?.data?.usernameAvailable === false) {
                        setUsernameTaken(true)
                    }
                })
                .catch(() => undefined)
        }, 400)
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [username])

    // Best-effort availability check for the email (only when the format is valid).
    useEffect(() => {
        setEmailTaken(false)
        const value = email.trim()
        if (!EMAIL_REGEX.test(value)) {
            return
        }
        let cancelled = false
        const timer = setTimeout(() => {
            API({}, {})
                .get(`${API_ENDPOINTS.REGISTER_AVAILABILITY}?email=${encodeURIComponent(value)}`)
                .then(response => {
                    if (!cancelled && response?.data?.emailAvailable === false) {
                        setEmailTaken(true)
                    }
                })
                .catch(() => undefined)
        }, 400)
        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [email])

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setFormError(null)
        dispatch(
            registerAction({
                data: { username, email, password },
                callbacks: {
                    success: () => router.push('/login'),
                    error: (err: any) => {
                        const message = err?.error || err?.message || 'Registration failed. Please try again.'
                        setFormError(message)
                    }
                }
            })
        )
    }

    return (
        <div className='register-container'>
            <div className='register-card'>
                <h2>Register</h2>
                <form className='register' onSubmit={handleRegister}>
                    <label>Introduce your new credentials or click &quot;Login&quot; if you already have them</label>
                    <div className='register__username'>
                        <input
                            type='text'
                            value={username}
                            name='Username'
                            placeholder='Username (3–30 characters)'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setUsername(event.target.value)
                                setFormError(null)
                            }}
                        />
                        {usernameTaken && (
                            <p className='register__hint' role='alert'>This username is already taken.</p>
                        )}
                    </div>
                    <div className='register__email'>
                        <input
                            type='email'
                            value={email}
                            name='Email'
                            placeholder='Email'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setEmail(event.target.value)
                                setFormError(null)
                            }}
                        />
                        {emailTaken && (
                            <p className='register__hint' role='alert'>An account with this email may already exist.</p>
                        )}
                    </div>
                    <div className='register__password'>
                        <input
                            type='password'
                            value={password}
                            name='Password'
                            placeholder='Password (min. 8 chars, letters + numbers)'
                            aria-describedby='register__password-help'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(event.target.value)
                                setFormError(null)
                            }}
                        />
                        <p
                            id='register__password-help'
                            className={passwordInvalid ? 'register__help register__help--error' : 'register__help'}
                        >
                            At least 8 characters, including a letter and a number.
                        </p>
                    </div>
                    {(fieldError || formError) && (
                        <p className='register__error' role='alert'>{fieldError ?? formError}</p>
                    )}
                    <button disabled={isDisabled}>Register</button>
                    <Link href='/login'>Login</Link>
                </form>
            </div>
        </div>
    )
}

export default Register
