import { useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import './Header.scss'
import '../../App.scss'
import Accordion from '../SimpleAccordion'
// import CircularProgress from './CircularIndeterminate'
import LoginButton from './LoginButton'
import LogoutButton from './Logout'
import { WEB_SUBTITLE } from '../../data/constants'
import { AppContext } from '../../App'
import { useLocation } from 'react-router-dom'
import parseJWT from '../../utils/parseJWT'

function Header() {
    const context = useContext(AppContext)
    const location = useLocation()

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedUser') || ''
        if (loggedUserJSON) {
            const parsedUser = JSON.parse(loggedUserJSON)
            const jwtData = parseJWT(parsedUser)
            context.setState({
                ...context,
                user: parsedUser,
                userId: jwtData?.id,
                username: jwtData?.username,
                picture: jwtData?.picture,
                config: {
                    headers: {
                        Authorization: `Bearer ${parsedUser}`
                    }
                }
            })
        }
    }, [JSON.stringify(location)])

    // Dynamic subtitle based on route
    const getSubtitle = () => {
        if (location.pathname === '/profile') {
            return `${context?.username}'s Profile`
        }
        return WEB_SUBTITLE
    }

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
            <p className='list__presentation'>{getSubtitle()}</p>
            <div className='separator' />
            {context?.user ? <Link to='/profile' className='header__profile' /> : <></>}
            {context?.user ? <LogoutButton /> : <LoginButton />}
        </section>
    )
}

export default Header
