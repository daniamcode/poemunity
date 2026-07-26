import { SeoHead } from '../src/components/SeoHead'
import ResetPassword from '../src/components/Auth/ResetPassword'

export default function ResetPasswordPage() {
    return (
        <>
            <SeoHead title='Reset password' noIndex />
            <ResetPassword />
        </>
    )
}
