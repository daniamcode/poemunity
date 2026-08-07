import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { getAuthorsByLetterAction, getAuthorsLettersAction } from '../../redux/actions/authorsActions'
import { getTypes } from '../../redux/actions/commonActions'
import { ACTIONS } from '../../redux/reducers/authorsReducers'
import { selectAuthorsByLetter } from '../../redux/selectors/authorCacheSelectors'
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
    const { isFetching } = useSelector((state: RootState) => state.authorsByLetterQuery)
    // Resolve name/slug through the normalized authorEntities store so renames
    // propagate without a refetch; count and ordering stay from the list cache.
    const storeAuthors = useSelector(selectAuthorsByLetter)

    // SERVER-RENDER FROM THE PROPS WHEN THE STORE IS STILL EMPTY.
    //
    // Same bug the poem lists had (see usePoemsList): the seeding below happens
    // in EFFECTS, and effects do not run during server rendering — so this page
    // fetched 251 authors, shipped every one of them inside `__NEXT_DATA__`,
    // and rendered NOT ONE LINK. Measured on the live site before this fix: 0
    // `/authors/` links in the HTML of the index page for 3,364 author pages.
    //
    // That made the whole author section invisible to a crawler except through
    // the sitemap, which is discovery with no internal linking behind it.
    //
    // Reading the props directly is hydration-safe: on the client's FIRST
    // render the effects have not run either, so the store is equally empty and
    // this produces byte-identical markup. Once seeded, the store wins.
    const authors = storeAuthors?.length ? storeAuthors : (initialAuthors ?? [])
    const seededLetters = (letters as string[] | undefined)?.length
        ? (letters as string[])
        : (initialLetters ?? [])

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

    const availableLetters = seededLetters

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
                {!isFetching && authors?.map(author => (
                    <Link
                        key={author.slug}
                        className='authors-index__author'
                        href={`/authors/${author.slug}`}
                    >
                        <span className='authors-index__author-name'>{author.name}</span>
                        <span className='authors-index__author-count'>
                            {author.count} {author.count === 1 ? 'poem' : 'poems'}
                        </span>
                    </Link>
                ))}
                {!isFetching && !authors?.length && (
                    <p className='authors-index__empty'>No authors found for this letter.</p>
                )}
            </section>
        </main>
    )
}
