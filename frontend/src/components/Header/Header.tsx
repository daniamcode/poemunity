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
import NotificationBell from '../Notifications/NotificationBell'

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
                    <Accordion closeOnSelect />
                </div>
            )}
            <div className='header__brand'>
                <Link href='/' className='header__logo' aria-label='Poemunity home'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src='/poemunity-logo.png'
                        alt='Poemunity'
                        className='header__logo-img'
                    />
                </Link>
                <p className='list__presentation'>{getSubtitle()}</p>
            </div>
            {/* Privacy / Terms / AI live in the footer only. They were desktop-only
                here (hidden below 900px), so this duplicated them for wide
                screens while leaving mobile with no route to them at all. AI
                content is now labelled where it appears instead. */}
            <div className='separator' />
            {/* Grouped so the avatar and the auth button space as one right-hand
                unit, instead of each becoming its own space-between column. */}
            <div className='header__actions'>
                {/* Before the avatar: the bell is the thing with news in it, and
                    it renders nothing at all when signed out. */}
                <NotificationBell />
                {context?.user ? (
                    <Link href='/profile' className='header__profile-picture' aria-label='Your profile'>
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
            </div>
        </section>
    )
}

export default Header
