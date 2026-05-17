import { useEffect, useContext } from 'react'
import Link from 'next/link'
import Accordion from '../SimpleAccordion'
// import CircularProgress from './CircularIndeterminate'
import LoginButton from './LoginButton'
import LogoutButton from './Logout'
import { WEB_SUBTITLE } from '../../data/constants'
import { AppContext } from '../../App'
import { useRouter } from 'next/router'
import parseJWT from '../../utils/parseJWT'
import { getAvatarColor, getInitials } from '../ListItem/components/AuthorAvatar'

function Header() {
    const context = useContext(AppContext)
    const router = useRouter()

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedUser') || ''
        if (!loggedUserJSON) return

        const parsedUser = JSON.parse(loggedUserJSON)
        const config = { headers: { Authorization: `Bearer ${parsedUser}` } }

        const applyToken = (token: string) => {
            const jwtData = parseJWT(token)
            context.setState({
                ...context,
                user: token,
                userId: jwtData?.id,
                username: jwtData?.username,
                picture: jwtData?.picture,
                bio: jwtData?.bio || '',
                preferredGenres: jwtData?.preferredGenres || [],
                name: jwtData?.name || '',
                surname: jwtData?.surname || '',
                city: jwtData?.city || '',
                country: jwtData?.country || '',
                birthYear: jwtData?.birthYear || null,
                gender: jwtData?.gender || '',
                privateFields: jwtData?.privateFields || [],
                config
            })
        }

        // Apply cached token immediately so the UI isn't blank while fetching
        applyToken(parsedUser)

        // Then refresh from DB to pick up any changes made in other sessions
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'
        fetch(`${apiBase}/api/v1/users/me`, { headers: config.headers })
            .then(res => res.ok ? res.json() : null)
            .then(freshToken => {
                if (freshToken && freshToken !== parsedUser) {
                    window.localStorage.setItem('loggedUser', JSON.stringify(freshToken))
                    applyToken(freshToken)
                }
            })
            .catch(() => {})
    }, [router.asPath])

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
