import React, { useState } from 'react'
import Link from 'next/link'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

// Mirrors the backend: whatever happens, the user is shown the same generic
// message so this page never reveals whether an account exists for the email.
const GENERIC_MESSAGE = 'If an account exists for that email, a reset link has been sent.'

const ForgotPassword = (): React.JSX.Element => {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        try {
            await API({}, {}).post(API_ENDPOINTS.PASSWORD_FORGOT, { email })
        } catch {
            // Intentionally swallow errors — the response is always generic so a
            // failed/rejected request must not reveal anything either.
        }
        setLoading(false)
        setSubmitted(true)
    }

    return (
        <div className='login-container'>
            <div className='login-card'>
                <h2>Forgot password</h2>
                {submitted
                    ? (
                        <div className='login'>
                            <p className='login__message' role='status'>{GENERIC_MESSAGE}</p>
                            <Link href='/login'>Back to login</Link>
                        </div>
                        )
                    : (
                        <form className='login' onSubmit={handleSubmit} data-testid='forgot-password'>
                            <label>Enter your email and we&apos;ll send you a link to reset your password.</label>
                            <div className='login__username'>
                                <input
                                    type='email'
                                    value={email}
                                    name='Email'
                                    placeholder='Email'
                                    onChange={event => setEmail(event.target.value)}
                                />
                            </div>
                            <button disabled={email.length === 0 || loading}>Send reset link</button>
                            <Link href='/login'>Back to login</Link>
                        </form>
                        )}
            </div>
        </div>
    )
}

export default ForgotPassword
