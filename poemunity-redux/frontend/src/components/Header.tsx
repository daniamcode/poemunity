import { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import './Header.scss'
import '../App.scss'
import Accordion from './SimpleAccordion'
// import CircularProgress from './CircularIndeterminate'
import LoginButton from './LoginButton'
import LogoutButton from './Logout'
import {
  WEB_SUBTITLE,
} from '../data/constants'
import { AppContext } from '../App';
import {useLocation} from 'react-router-dom'
import parseJWT from '../utils/parseJWT'

function Header () {
  const context = useContext(AppContext);
  const location = useLocation()

  useEffect(()=>{
    const loggedUserJSON = window.localStorage.getItem('loggedUser') || ''
    if(loggedUserJSON) {
      context.setState({
        ...context, 
        user: JSON.parse(loggedUserJSON), 
        userId: parseJWT(JSON.parse(loggedUserJSON))?.id,
        username: parseJWT(JSON.parse(loggedUserJSON))?.username,
        picture: parseJWT(JSON.parse(loggedUserJSON))?.picture,
        config: {
          headers: {
            Authorization: `Bearer ${JSON.parse(loggedUserJSON)}`
        }}})
    }
  }, [JSON.stringify(location)])
  
  // if (isLoading) {
  //   return <CircularProgress />
  // }
  return (
    <section className='header'>
      <div className='header__dropdown'>
        <Accordion />
      </div>
      <div className='header__logo'>
        <Link to='/' className='header__text-logo-first'>
          P
        </Link>
        <Link to='/' className='header__logo-icon' />
        <Link to='/' className='header__text-logo-second'>
          emunity
        </Link>
      </div>
      <p className='list__presentation'>{WEB_SUBTITLE}</p>
      <div className='separator' />
      {context?.user ? (
        <Link to='/profile' className='header__profile' />
      ) : (
        <></>
      )}
      {context?.user ? <LogoutButton /> : <LoginButton />}
    </section>
  )
}

export default Header
