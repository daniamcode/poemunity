import React from 'react'
import { useHistory } from 'react-router'
import './Header.scss'

const Logout = () => {
  const history = useHistory()
 
  const handleLogout = (event: React.SyntheticEvent) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedUser')
    history.push('/')
  }

  return (
    <button className='header__logout' onClick={handleLogout} />
  )
}

export default Logout
