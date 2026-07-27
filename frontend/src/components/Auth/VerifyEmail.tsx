import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

type Status = 'verifying' | 'success' | 'error'

// Confirms an email-verification link. Reads ?token= from the URL and POSTs it
// on mount; there is no form — the link itself is the action.
const VerifyEmail = (): React.JSX.Element => {
    const router = useRouter()
    const [status, setStatus] = useState<Status>('verifying')

    useEffect(() => {
        // Wait for Next to parse the query string on the client before deciding.
        // Compare against `false` explicitly so a router without isReady (e.g. a
        // test mock) is treated as ready rather than stuck "verifying".
        if (router.isReady === false) {
            return
        }
        const token = typeof router.query.token === 'string' ? router.query.token : ''
        if (!token) {
            setStatus('error')
            return
        }
        let cancelled = false
        API({}, {}).post(API_ENDPOINTS.VERIFY_CONFIRM, { token })
            .then(() => { if (!cancelled) { setStatus('success') } })
            .catch(() => { if (!cancelled) { setStatus('error') } })
        return () => { cancelled = true }
    }, [router.isReady, router.query.token])

    return (
        <div className='login-container'>
            <div className='login-card'>
                <h2>Verify email</h2>
                <div className='login'>
                    {status === 'verifying' && (
                        <p className='login__message' role='status'>Verifying your email…</p>
                    )}
                    {status === 'success' && (
                        <>
                            <p className='login__message' role='status'>
                                Your email has been verified. You can now log in.
                            </p>
                            <Link href='/login'>Go to login</Link>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <p className='login__error' role='alert'>
                                This verification link is invalid or has expired.
                            </p>
                            <Link href='/login'>Back to login</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
