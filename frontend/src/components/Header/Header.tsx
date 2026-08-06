import Image from 'next/image'
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
                    {/* `next/image`, not `<img>`: the source PNG is 547x120 and
                        the header draws it at 91x20, so the whole 37 KiB file
                        was downloaded for about 3% of its pixels, on every page.
                        Optimised it is a couple of KiB in WebP/AVIF.

                        `priority` because this is in the header and always above
                        the fold — lazy-loading it would delay the one image a
                        visitor sees first. Width/height are the intrinsic ratio;
                        the CSS still sets the drawn height.

                        `sizes` is what makes that saving real, and it is not
                        optional here. Without it `next/image` derives the srcset
                        from the `width` prop alone — 1x and 2x of it — so it
                        UPSCALED a 547px-wide source to 640px and shipped 17 KiB
                        to draw 91px on a phone. With `sizes` Next emits a
                        width-descriptor srcset and the browser picks the
                        candidate that matches the box it will actually occupy.
                        The four widths below are the four heights in
                        Header.scss multiplied by the 547/120 aspect ratio
                        (20/28/40/48px); if a breakpoint moves there, it moves
                        here too, or the browser goes back to guessing 100vw. */}
                    <Image
                        src='/poemunity-logo.png'
                        alt='Poemunity'
                        className='header__logo-img'
                        width={547}
                        height={120}
                        sizes='(min-width: 1200px) 219px, (min-width: 900px) 182px, (min-width: 481px) 128px, 91px'
                        priority
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
                            <Image
                                src={context.picture}
                                alt={context.username}
                                className='header__profile-img'
                                width={32}
                                height={32}
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
