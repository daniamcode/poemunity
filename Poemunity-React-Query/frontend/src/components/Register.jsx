import React, { useState } from 'react'
import useRegister from '../react-query/useRegister'
import { NavLink } from 'react-router-dom'
import './Register.scss'

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
    <form className='register' onSubmit={handleRegister}>
        <label>Introduce your new credentials or click "Login" if you already have them</label>
          <div className='register__username'>
            <input
              type='text'
              value={username}
              name='Username'
              placeholder='Username'
              onChange={
                ({ target }) => setUsername(target.value)}
            />
          </div>
          <div className='register__email'>
            <input
              type='text'
              value={email}
              name='Email'
              placeholder='Email'
              onChange={
                ({ target }) => setEmail(target.value)}
            />
          </div>
          <div className='register__password'>
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
