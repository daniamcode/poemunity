import { useState } from 'react'
import './Login.scss'
import { useHistory } from 'react-router'
import { NavLink } from 'react-router-dom'
// import { FormElement } from '../typescript/types'
// import { manageSuccess } from '../utils/notifications'
import { useAppDispatch } from '../redux/store'
import { loginAction } from '../redux/actions/loginActions'

const Login = (): JSX.Element => {
    const history = useHistory()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    // Redux
    const dispatch = useAppDispatch()

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        // manageSuccess('Logging in...') // I don't need this, I used it just for testing purposes
        event.preventDefault()
        dispatch(
            loginAction({
                data: {
                    username,
                    password
                },
                callbacks: {
                    success: data => {
                        window.localStorage.setItem(
                            'loggedUser',
                            JSON.stringify(data)
                        )
                        history.push('profile')
                    },
                    error: () => {
                        // setErrorMessage('Wrong credentials')
                        console.log('something went wrong in login!')
                        // history.push('/')
                        // setTimeout(()=> {
                        //   setErrorMessage(null)
                        // }, 3000)
                    }
                }
            })
        )
        setUsername('')
        setPassword('')
    }

    return (
        <form className='login' onSubmit={handleLogin} data-testid='login'>
            <label>
                Introduce your login credentials or click "Register" if you
                don't have them
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
            <button>Login</button>
            <NavLink to='/register'>Register</NavLink>
            {/* <Notification message={errorMessage}/> */}
        </form>
    )
}

export default Login
