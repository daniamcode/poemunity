import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { registerAction } from '../../redux/actions/loginActions'
import { useAppDispatch } from '../../redux/store'

const Register: React.FC = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        dispatch(
            registerAction({
                data: {
                    username,
                    email,
                    password
                },
                callbacks: {
                    success: () => {
                        router.push('/login')
                    },
                    error: () => {
                        console.error('Something went wrong')
                    }
                }
            })
        )
    }

    return (
        <div className='register-container'>
            <div className='register-card'>
                <h2>Register</h2>
                <form className='register' onSubmit={handleRegister}>
                    <label>Introduce your new credentials or click &quot;Login&quot; if you already have them</label>
                    <div className='register__username'>
                        <input
                            type='text'
                            value={username}
                            name='Username'
                            placeholder='Username'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
                        />
                    </div>
                    <div className='register__email'>
                        <input
                            type='text'
                            value={email}
                            name='Email'
                            placeholder='Email'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                        />
                    </div>
                    <div className='register__password'>
                        <input
                            type='password'
                            value={password}
                            name='Password'
                            placeholder='Password'
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                        />
                    </div>
                    <button disabled={username.length === 0 || email.length === 0 || password.length === 0}>
                        Register
                    </button>
                    <Link href='/login'>Login</Link>
                </form>
            </div>
        </div>
    )
}

export default Register
