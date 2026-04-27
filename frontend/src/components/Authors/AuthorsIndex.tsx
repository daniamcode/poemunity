import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getAuthorsByLetterAction, getAuthorsLettersAction } from '../../redux/actions/authorsActions'
import { RootState, useAppDispatch } from '../../redux/store'
import { Author } from '../../typescript/interfaces'
import './Authors.scss'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function AuthorsIndex() {
    const dispatch = useAppDispatch()
    const [activeLetter, setActiveLetter] = useState('A')

    const { item: letters } = useSelector((state: RootState) => state.authorsLettersQuery)
    const { item: authors, isFetching } = useSelector((state: RootState) => state.authorsByLetterQuery)

    useEffect(() => {
        document.title = 'Authors | Poemunity'
        dispatch(getAuthorsLettersAction({}))
    }, [])

    useEffect(() => {
        dispatch(getAuthorsByLetterAction({ letter: activeLetter }))
    }, [activeLetter])

    const availableLetters = (letters as string[]) || []

    return (
        <main className='authors-index'>
            <h1 className='authors-index__title'>Authors</h1>

            <nav className='authors-index__alphabet' aria-label='Browse authors by letter'>
                {ALPHABET.map(letter => {
                    const hasAuthors = availableLetters.includes(letter)
                    const activeClass = activeLetter === letter ? ' active' : ''
                    const disabledClass = !hasAuthors ? ' disabled' : ''
                    return (
                        <button
                            key={letter}
                            className={`authors-index__letter${activeClass}${disabledClass}`}
                            onClick={() => hasAuthors && setActiveLetter(letter)}
                            aria-current={activeLetter === letter ? 'true' : undefined}
                            disabled={!hasAuthors}
                        >
                            {letter}
                        </button>
                    )
                })}
            </nav>

            <section className='authors-index__list'>
                {isFetching && <p className='authors-index__loading'>Loading...</p>}
                {!isFetching && (authors as Author[])?.map(author => (
                    <Link
                        key={author.slug}
                        className='authors-index__author'
                        to={`/authors/${author.slug}`}
                    >
                        <span className='authors-index__author-name'>{author.name}</span>
                        <span className='authors-index__author-count'>{author.count} poems</span>
                    </Link>
                ))}
                {!isFetching && !(authors as Author[])?.length && (
                    <p className='authors-index__empty'>No authors found for this letter.</p>
                )}
            </section>
        </main>
    )
}
