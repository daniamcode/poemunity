import React, {useState} from 'react'
import './Login.scss'
import { useHistory } from 'react-router'
import { NavLink } from 'react-router-dom'
import useLogin from '../react-query/useLogin'
import { FormElement } from '../typescript/types'
import { manageSuccess } from '../utils/notifications'

const Login = (): JSX.Element => {
  const history = useHistory()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const loginQuery: {mutate: Function} = useLogin()

  const handleLogin = (event: any) => {
    manageSuccess('Logging in...')
    event.preventDefault()
    loginQuery?.mutate({username, password})
    setUsername('')
    setPassword('')
  }

  return (
    <form className='login' onSubmit={handleLogin} data-testid='login'>
        <label>Introduce your login credentials or click "Register" if you don't have them</label>
          <div className='login__username'>
            <input
              type='text'
              value={username}
              name='Username'
              placeholder='Username'
              onChange={
                (event) => setUsername(event.target.value)}
            />
          </div>
          <div className='login__password'>
            <input
              type='password'
              value={password}
              name='Password'
              placeholder='Password'
              onChange={
                ( event ) => setPassword(event.target.value)}
            />
          </div>
          <button>
            Login
          </button>
          <NavLink to='/register'>Register</NavLink>
          {/* <Notification message={errorMessage}/> */}
          
        </form>
  )
}

export default Login
