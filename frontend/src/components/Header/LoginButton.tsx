import { useRouter } from 'next/router'

const LoginButton = () => {
    const router = useRouter()
    return <button className='header__login' onClick={() => router.push('/login')} aria-label='Log in' />
}

export default LoginButton
