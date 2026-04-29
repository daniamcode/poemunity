import { useState, useEffect } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import cx from 'classnames'
import './Header/Header'
import { Link } from 'react-router-dom'
import { CATEGORIES_TITLE, CATEGORIES, MUST_HAVE_CATEGORIES, ALL, CATEGORIES_BROWSE_ALL, categoryToSlug } from '../data/constants'

interface SimpleAccordionProps {
    genre?: string
}

export default function SimpleAccordion({ genre }: SimpleAccordionProps) {
    const [expanded, setExpanded] = useState(false)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        if (genre) {
            setExpanded(true)
            if (!MUST_HAVE_CATEGORIES.some(c => categoryToSlug(c) === genre)) {
                setShowAll(true)
            }
        }
    }, [genre])

    const isActiveCategory = (category: string) => {
        return genre === categoryToSlug(category)
    }

    const visibleCategories = showAll ? CATEGORIES : MUST_HAVE_CATEGORIES

    return (
        <Accordion className='accordion' expanded={expanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1a-content'
                id='panel1a-header'
                onClick={() => setExpanded(!expanded)}
            >
                <div className='header__dropdown-categories-icon'></div>
                <p className='header__dropdown-categories'>{CATEGORIES_TITLE}</p>
            </AccordionSummary>
            <div className='accordion__list'>
                {[...visibleCategories].sort().map(category => (
                    <AccordionDetails key={category}>
                        <Link
                            className={cx('header__dropdown-subcategories', {
                                active: isActiveCategory(category)
                            })}
                            to={`/${categoryToSlug(category)}`}
                        >
                            {category}
                        </Link>
                    </AccordionDetails>
                ))}
            </div>
            <AccordionDetails>
                <Link
                    className={cx('header__dropdown-subcategories', {
                        active: !genre
                    })}
                    to='/'
                >
                    {ALL}
                </Link>
            </AccordionDetails>
            {!showAll && (
                <AccordionDetails>
                    <button
                        className='header__dropdown-subcategories authors-accordion__browse-all'
                        onClick={() => setShowAll(true)}
                    >
                        {CATEGORIES_BROWSE_ALL}
                    </button>
                </AccordionDetails>
            )}
        </Accordion>
    )
}
