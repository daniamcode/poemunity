import { SeoHead } from '../src/components/SeoHead'
import ForgotPassword from '../src/components/Auth/ForgotPassword'

export default function ForgotPasswordPage() {
    return (
        <>
            <SeoHead title='Forgot password' noIndex />
            <ForgotPassword />
        </>
    )
}
