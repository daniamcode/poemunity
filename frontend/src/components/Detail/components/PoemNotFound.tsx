import Link from 'next/link'

export function PoemNotFound() {
    return (
        <main className='page-not-found__container'>
            <section className='page-not-found__message'>
                <h1 className='page-not-found__title'>Error - 404</h1>
                <p className='page-not-found__text'>Nothing to see here</p>
                <Link className='page-not-found__link' href='/'>
                    Back to Dashboard
                </Link>
            </section>
        </main>
    )
}
