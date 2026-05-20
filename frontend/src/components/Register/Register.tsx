import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { registerAction } from '../../redux/actions/loginActions'
import { useAppDispatch } from '../../redux/store'

function validate(username: string, email: string, password: string): string | null {
    if (username.length > 0 && (username.length < 3 || username.length > 30)) {
        return 'Username must be between 3 and 30 characters.'
    }
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Please enter a valid email address.'
    }
    if (password.length > 0 && password.length < 8) {
        return 'Password must be at least 8 characters.'
    }
    return null
}

const Register: React.FC = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const router = useRouter()
    const dispatch = useAppDispatch()

    const inlineError = validate(username, email, password)
    const isEmpty = !username || !email || !password
    const isDisabled = isEmpty || !!inlineError

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
                    </div>
                    <div className='register__password'>
                        <input
                            type='password'
                            value={password}
                            name='Password'
                            placeholder='Password (min. 8 characters)'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(event.target.value)
                                setFormError(null)
                            }}
                        />
                    </div>
                    {(inlineError || formError) && (
                        <p className='register__error' role='alert'>{inlineError ?? formError}</p>
                    )}
                    <button disabled={isDisabled}>Register</button>
                    <Link href='/login'>Login</Link>
                </form>
            </div>
        </div>
    )
}

export default Register
