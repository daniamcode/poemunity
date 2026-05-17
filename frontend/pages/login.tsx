import { SeoHead } from '../src/components/SeoHead'
import Login from '../src/components/Header/Login'

export default function LoginPage() {
    return (
        <>
            <SeoHead title='Login' noIndex />
            <Login />
        </>
    )
}
