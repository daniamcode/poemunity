import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const Login = (): React.JSX.Element => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            if (!res.ok) {
                setError('Invalid username or password')
                return
            }
            const token = await res.json()
            window.localStorage.setItem('loggedUser', JSON.stringify(token))
            const from = router.query.from as string | undefined
            router.push(from ?? '/profile')
        } catch {
            setError('Something went wrong. Please try again.')
        }
        setUsername('')
        setPassword('')
    }

    return (
        <div className='login-container'>
            <div className='login-card'>
                <h2>Login</h2>
                <form className='login' onSubmit={handleLogin} data-testid='login'>
                    <label>
                        Introduce your login credentials or click &quot;Register&quot; if you don&apos;t have them
                    </label>
                    <div className='login__username'>
                        <input
                            type='text'
                            value={username}
                            name='Username'
                            placeholder='Username'
                            onChange={event => setUsername(event.target.value)}
                        />
                    </div>
                    <div className='login__password'>
                        <input
                            type='password'
                            value={password}
                            name='Password'
                            placeholder='Password'
                            onChange={event => setPassword(event.target.value)}
                        />
                    </div>
                    {error && <p className='login__error'>{error}</p>}
                    <button disabled={username.length === 0 || password.length === 0}>Login</button>
                    <Link href='/register'>Register</Link>
                </form>
            </div>
        </div>
    )
}

export default Login
