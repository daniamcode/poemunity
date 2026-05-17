import { SeoHead } from '../src/components/SeoHead'
import Register from '../src/components/Register/Register'

export default function RegisterPage() {
    return (
        <>
            <SeoHead title='Register' noIndex />
            <Register />
        </>
    )
}
