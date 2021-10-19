import React, {useState} from 'react'
import './Header.scss'
import { useHistory } from 'react-router'
import { NavLink } from 'react-router-dom'
import useLogin from '../react-query/useLogin'

const Login = () => {
  const history = useHistory()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const loginQuery = useLogin()

  const handleLogin = (event) => {
    event.preventDefault()
    loginQuery.mutate({username, password})
    
    setUsername('')
    setPassword('')
  }

  return (
    <form onSubmit={handleLogin}>
          <div>
            <input
              type='text'
              value={username}
              name='Username'
              placeholder='Username'
              onChange={
                ({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            <input
              type='password'
              value={password}
              name='Password'
              placeholder='Password'
              onChange={
                ({ target }) => setPassword(target.value)}
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
