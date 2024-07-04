import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Register.scss'
import { registerAction } from '../../redux/actions/loginActions'
import { useHistory } from 'react-router'
import { useAppDispatch } from '../../redux/store'

const Register = () => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const history = useHistory()

    // Redux
    const dispatch = useAppDispatch()

    const handleRegister = event => {
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
                        history.push('/login')
                    },
                    error: () => {
                        // setErrorMessage('Wrong credentials')
                        // manageError(error.response.data.error)
                        console.log('Something went wrong')
                        // setTimeout(()=> {
                        //   setErrorMessage(null)
                        // }, 3000)
                    }
                }
            })
        )

        // setUsername('')
        // setEmail('')
        // setPassword('')
    }

    return (
        <form className='register' onSubmit={handleRegister}>
            <label>Introduce your new credentials or click "Login" if you already have them</label>
            <div className='register__username'>
                <input
                    type='text'
                    value={username}
                    name='Username'
                    placeholder='Username'
                    onChange={({ target }) => setUsername(target.value)}
                />
            </div>
            <div className='register__email'>
                <input
                    type='text'
                    value={email}
                    name='Email'
                    placeholder='Email'
                    onChange={({ target }) => setEmail(target.value)}
                />
            </div>
            <div className='register__password'>
                <input
                    type='password'
                    value={password}
                    name='Password'
                    placeholder='Password'
                    onChange={({ target }) => setPassword(target.value)}
                />
            </div>
            <button disabled={username.length === 0 || email.length === 0 || password.length === 0}>Register</button>
            {/* <Notification message={errorMessage}/> */}
            <NavLink to='/login'>Login</NavLink>
        </form>
    )
}

export default Register
