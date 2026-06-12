import Link from 'next/link'

export default function Footer() {
    return (
        <footer className='footer'>
            <nav className='footer__links' aria-label='Legal links'>
                <Link href='/privacy'>Privacy</Link>
                <Link href='/terms'>Terms</Link>
                <Link href='/terms#ai-community-activity'>AI activity</Link>
            </nav>
            <p className='footer__note'>
                Poemunity may include AI-assisted community activity to help poems receive early feedback.
            </p>
        </footer>
    )
}
