import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Link from 'next/link'
import { AUTHORS_TITLE, AUTHORS_BROWSE_ALL } from '../data/constants'
import { getTopAuthorsAction } from '../redux/actions/authorsActions'
import { selectTopAuthors } from '../redux/selectors/authorCacheSelectors'
import { RootState, useAppDispatch } from '../redux/store'

interface AuthorsAccordionProps {
    authorSlug?: string
}

export default function AuthorsAccordion({ authorSlug }: AuthorsAccordionProps) {
    const [expanded, setExpanded] = useState(false)
    const dispatch = useAppDispatch()
    const { isFetching } = useSelector((state: RootState) => state.topAuthorsQuery)
    // Names/pictures/slugs resolve through the normalized authorEntities store so
    // an author rename propagates here without a refetch.
    const authors = useSelector(selectTopAuthors)

    useEffect(() => {
        if (authorSlug) setExpanded(true)
    }, [authorSlug])

    useEffect(() => {
        dispatch(getTopAuthorsAction({ params: { limit: 10 } }))
    }, [])

    return (
        <Accordion className='accordion' expanded={expanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='authors-content'
                id='authors-header'
                onClick={() => setExpanded(!expanded)}
            >
                <div className='header__dropdown-categories-icon'></div>
                <p className='header__dropdown-categories'>{AUTHORS_TITLE}</p>
            </AccordionSummary>
            <div className='accordion__list'>
                {!isFetching && authors?.map(author => (
                    <AccordionDetails key={author.slug}>
                        <Link
                            className={`header__dropdown-subcategories${authorSlug === author.slug ? ' active' : ''}`}
                            href={`/authors/${author.slug}`}
                        >
                            {author.name}
                        </Link>
                    </AccordionDetails>
                ))}
            </div>
            <AccordionDetails>
                <Link className='header__dropdown-subcategories authors-accordion__browse-all' href='/authors'>
                    {AUTHORS_BROWSE_ALL}
                </Link>
            </AccordionDetails>
        </Accordion>
    )
}
