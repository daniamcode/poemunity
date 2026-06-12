import { useContext } from 'react'
import Link from 'next/link'
import Accordion from '../SimpleAccordion'
// import CircularProgress from './CircularIndeterminate'
import LoginButton from './LoginButton'
import LogoutButton from './Logout'
import { WEB_SUBTITLE } from '../../data/constants'
import { AppContext } from '../../App'
import { useRouter } from 'next/router'
import { getAvatarColor, getInitials } from '../ListItem/components/AuthorAvatar'

function Header() {
    const context = useContext(AppContext)
    const router = useRouter()

    // Dynamic subtitle based on route
    const getSubtitle = () => {
        if (router.pathname === '/profile') {
            return `${context?.username}'s private profile`
        }
        return WEB_SUBTITLE
    }

    const isAuthOrProfilePage = ['/login', '/register', '/profile'].includes(router.pathname)

    // if (isLoading) {
    //   return <CircularProgress />
    // }
    return (
        <section className='header'>
            {!isAuthOrProfilePage && (
                <div className='header__dropdown'>
                    <Accordion />
                </div>
            )}
            <div className='header__brand'>
                <div className='header__logo'>
                    <Link href='/' className='header__text-logo-first'>
                        P
                    </Link>
                    <Link href='/' className='header__logo-icon' />
                    <Link href='/' className='header__text-logo-second'>
                        emunity
                    </Link>
                </div>
                <p className='list__presentation'>{getSubtitle()}</p>
            </div>
            <div className='separator' />
            <nav className='header__legal-links' aria-label='Policy links'>
                <Link href='/privacy'>Privacy</Link>
                <Link href='/terms'>Terms</Link>
                <Link href='/terms#ai-community-activity' title='AI activity disclosure'>AI</Link>
            </nav>
            {context?.user ? (
                <Link href='/profile' className='header__profile-picture'>
                    {context?.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={context.picture}
                            alt={context.username}
                            className='header__profile-img'
                            loading='lazy'
                        />
                    ) : (
                        <span
                            className='header__profile-initials'
                            style={{ backgroundColor: getAvatarColor(context.username || '') }}
                        >
                            {getInitials(context.username || '?')}
                        </span>
                    )}
                </Link>
            ) : <></>}
            {context?.user ? <LogoutButton /> : <LoginButton />}
        </section>
    )
}

export default Header
