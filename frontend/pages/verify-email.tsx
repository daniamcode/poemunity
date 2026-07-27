import { SeoHead } from '../src/components/SeoHead'
import VerifyEmail from '../src/components/Auth/VerifyEmail'

export default function VerifyEmailPage() {
    return (
        <>
            <SeoHead title='Verify email' noIndex />
            <VerifyEmail />
        </>
    )
}
