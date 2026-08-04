import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'
import { RootState, useAppDispatch } from '../../redux/store'
import { getPoemOfTheWeekAction } from '../../redux/actions/poemsActions'
import { AuthorAvatar } from '../ListItem/components/AuthorAvatar'
import { slugify } from '../../utils/urlUtils'
import { POEM_OF_THE_WEEK_TITLE } from '../../data/constants'

/** How much of the poem to show before the reader has to open it. */
const EXCERPT_LINES = 4

function excerptOf(text: string): string[] {
    return String(text || '')
        .split('\n')
        .filter(line => line.trim())
        .slice(0, EXCERPT_LINES)
}

/**
 * One famous poem, the same for everyone, rotating every Monday.
 *
 * The pick is entirely the server's (GET /poems/poem-of-the-week) and derived
 * from the date rather than stored, so there is nothing to recompute here and no
 * way for two visitors to see different poems in the same week.
 *
 * Renders nothing at all while loading, on error, or when there is no poem: it
 * is a sidebar extra, and a spinner or an error box in the corner of the page
 * costs the reader more attention than the feature is worth.
 */
export function PoemOfTheWeek() {
    const dispatch = useAppDispatch()
    const query = useSelector((state: RootState) => state.poemOfTheWeekQuery)
    const data = query?.item

    useEffect(() => {
        if (!query?.item && !query?.isFetching && !query?.isError) {
            dispatch(getPoemOfTheWeekAction())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const poem = data?.poem
    if (!poem?.id) return null

    const href = `/detail/${poem.slug || poem.id}`
    const authorSlug = poem.authorSlug || slugify(poem.author)

    return (
        <section className='potw' aria-labelledby='potw-heading'>
            <h2 className='potw__heading' id='potw-heading'>{POEM_OF_THE_WEEK_TITLE}</h2>
            {data?.weekStart && (
                <p className='potw__week'>Week of {format(new Date(data.weekStart), 'd MMM yyyy')}</p>
            )}

            <Link href={href} className='potw__title'>{poem.title}</Link>

            {/* ONE link around avatar and name, not one each: two adjacent
                links to the same place with the same accessible name make a
                screen reader announce the destination twice. */}
            <Link href={`/authors/${authorSlug}`} className='potw__author'>
                {/* aria-hidden because AuthorAvatar labels itself with the poet's
                    name, and the name is already the next thing in this link —
                    without it the link announces the name twice. */}
                <span aria-hidden='true'>
                    {/* 28px here, not the 44px default — see PoemOfTheWeek.scss. */}
                    <AuthorAvatar name={poem.author} picture={poem.picture} size={28} />
                </span>
                <span className='potw__author-name'>{poem.author}</span>
            </Link>

            {/* One element per verse line, not a single pre-line block. The rail
                is narrow enough that most lines wrap, and a wrapped continuation
                is indistinguishable from the next line of the poem — four lines
                of verse read as eight ragged ones. Separate blocks let each line
                carry a hanging indent, which is how verse has always been set in
                a narrow column. */}
            <p className='potw__excerpt'>
                {excerptOf(poem.poem).map((line, i) => (
                    <span className='potw__line' key={i}>{line}</span>
                ))}
            </p>
            <Link href={href} className='potw__read'>Read the poem</Link>
        </section>
    )
}

export default PoemOfTheWeek
