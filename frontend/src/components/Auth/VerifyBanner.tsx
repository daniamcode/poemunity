import React, { useContext, useState } from 'react'
import { AppContext } from '../../App'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

// Soft, non-blocking reminder shown to a logged-in user whose email is not yet
// verified. Publishing is not hard-gated by default (see the backend
// requireVerified middleware / REQUIRE_EMAIL_VERIFICATION flag), so this banner
// is the primary nudge to verify.
const VerifyBanner = (): React.JSX.Element | null => {
    const context = useContext(AppContext)
    const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

    // Only for signed-in, unverified users.
    if (!context.userId || context.emailVerified !== false) {
        return null
    }

    const handleResend = async () => {
        if (state === 'sending') {
            return
        }
        setState('sending')
        try {
            await API({}, {}).post(API_ENDPOINTS.VERIFY_RESEND)
        } catch {
            // The endpoint is intentionally generic; nothing actionable to show.
        }
        setState('sent')
    }

    return (
        <div className='verify-banner' role='status'>
            <span className='verify-banner__text'>
                Please verify your email address to secure your account.
            </span>
            {state === 'sent'
                ? (
                    <span className='verify-banner__sent'>Verification email sent.</span>
                    )
                : (
                    <button
                        className='verify-banner__button'
                        onClick={handleResend}
                        disabled={state === 'sending'}
                    >
                        {state === 'sending' ? 'Sending…' : 'Resend link'}
                    </button>
                    )}
        </div>
    )
}

export default VerifyBanner
