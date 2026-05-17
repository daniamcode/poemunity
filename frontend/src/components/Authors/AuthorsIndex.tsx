import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { getAuthorsByLetterAction, getAuthorsLettersAction } from '../../redux/actions/authorsActions'
import { getTypes } from '../../redux/actions/commonActions'
import { ACTIONS } from '../../redux/reducers/authorsReducers'
import { RootState, useAppDispatch } from '../../redux/store'
import { Author } from '../../typescript/interfaces'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const ORIGIN_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'famous', label: 'Famous' },
    { value: 'user', label: 'Users' },
    { value: 'ai', label: 'AI' }
]

interface AuthorsIndexProps {
    initialLetters?: string[]
    initialAuthors?: Author[]
}

export default function AuthorsIndex({ initialLetters, initialAuthors }: AuthorsIndexProps) {
    const dispatch = useAppDispatch()
    const [activeLetter, setActiveLetter] = useState('A')
    const [activeOrigin, setActiveOrigin] = useState('all')
    const lettersSeeded = useRef(false)
    const authorsSeeded = useRef(false)

    const { item: letters } = useSelector((state: RootState) => state.authorsLettersQuery)
    const { item: authors, isFetching } = useSelector((state: RootState) => state.authorsByLetterQuery)

    useEffect(() => {
        if (initialLetters) {
            const { fulfilledAction } = getTypes(ACTIONS.AUTHORS_LETTERS)
            dispatch({ type: fulfilledAction, payload: initialLetters })
            lettersSeeded.current = true
        }
    }, [dispatch])

    useEffect(() => {
        if (initialAuthors) {
            const { fulfilledAction } = getTypes(ACTIONS.AUTHORS_BY_LETTER)
            dispatch({ type: fulfilledAction, payload: initialAuthors })
            authorsSeeded.current = true
        }
    }, [dispatch])

    useEffect(() => {
        if (lettersSeeded.current) {
            lettersSeeded.current = false
            return
        }
        dispatch(getAuthorsLettersAction({ origin: activeOrigin }))
    }, [activeOrigin])

    useEffect(() => {
        if (authorsSeeded.current) {
            authorsSeeded.current = false
            return
        }
        dispatch(getAuthorsByLetterAction({ letter: activeLetter, origin: activeOrigin }))
    }, [activeLetter, activeOrigin])

    const availableLetters = (letters as string[]) || []

    function handleOriginChange(origin: string) {
        setActiveOrigin(origin)
        setActiveLetter('A')
    }

    return (
        <main className='authors-index'>
            <h1 className='authors-index__title'>Authors</h1>

            <div className='authors-index__origin-filter'>
                {ORIGIN_FILTERS.map(f => (
                    <button
                        key={f.value}
                        className={`authors-index__origin-btn${activeOrigin === f.value ? ' active' : ''}`}
                        onClick={() => handleOriginChange(f.value)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

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
                        href={`/authors/${author.slug}`}
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
