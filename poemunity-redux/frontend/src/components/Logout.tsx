import React, { useContext } from 'react'
import { AppContext } from '../App';
import { useHistory } from 'react-router'
import './Header.scss'

const Logout = () => {
  const history = useHistory()
  const context = useContext(AppContext);
 
  const handleLogout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    context.setState({...context, user: '' })
    window.localStorage.removeItem('loggedUser')
    history.push('/')
  }

  return (
    <button className='header__logout' onClick={handleLogout} />
  )
}

export default Logout
