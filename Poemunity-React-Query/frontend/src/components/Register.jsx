import React, { useState } from 'react'
import useRegister from '../react-query/useRegister'
import { NavLink } from 'react-router-dom'
import './Header.scss'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const registerMutation = useRegister()

  const handleRegister = (event) => {
    event.preventDefault()

    registerMutation.mutate({username, email, password})
    
    // setUsername('')
    // setEmail('')
    // setPassword('')
  }


  return (
    <form onSubmit={handleRegister}>
          <div>
            <input
              type='text'
              value={username}
              name='Username'
              placeholder='Username'
              onChange={
                ({ target }) => setUsername(target.value)}
            />
            <input
              type='text'
              value={email}
              name='Email'
              placeholder='Email'
              onChange={
                ({ target }) => setEmail(target.value)}
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
            Register
          </button>
          {/* <Notification message={errorMessage}/> */}
          <NavLink to='/login'>Login</NavLink>

          
        </form>
  )
}

export default Register
