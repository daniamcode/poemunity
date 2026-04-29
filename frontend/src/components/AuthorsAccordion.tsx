import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Link } from 'react-router-dom'
import { AUTHORS_TITLE, AUTHORS_BROWSE_ALL } from '../data/constants'
import { getTopAuthorsAction } from '../redux/actions/authorsActions'
import { RootState, useAppDispatch } from '../redux/store'
import type { Author } from '../typescript/interfaces'

interface AuthorsAccordionProps {
    authorSlug?: string
}

export default function AuthorsAccordion({ authorSlug }: AuthorsAccordionProps) {
    const [expanded, setExpanded] = useState(false)
    const dispatch = useAppDispatch()
    const { item: authors, isFetching } = useSelector((state: RootState) => state.topAuthorsQuery)

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
                {!isFetching && (authors as Author[])?.map(author => (
                    <AccordionDetails key={author.slug}>
                        <Link
                            className={`header__dropdown-subcategories${authorSlug === author.slug ? ' active' : ''}`}
                            to={`/authors/${author.slug}`}
                        >
                            {author.name}
                        </Link>
                    </AccordionDetails>
                ))}
            </div>
            <AccordionDetails>
                <Link className='header__dropdown-subcategories authors-accordion__browse-all' to='/authors'>
                    {AUTHORS_BROWSE_ALL}
                </Link>
            </AccordionDetails>
        </Accordion>
    )
}
