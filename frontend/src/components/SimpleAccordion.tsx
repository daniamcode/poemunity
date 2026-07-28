import { useState, useEffect } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import cx from 'classnames'
import './Header/Header'
import Link from 'next/link'
import { CATEGORIES_TITLE, CATEGORIES, MUST_HAVE_CATEGORIES, ALL, CATEGORIES_BROWSE_ALL, categoryToSlug } from '../data/constants'

interface SimpleAccordionProps {
    genre?: string
    /**
     * Collapse the panel after a category is chosen. On for the header dropdown,
     * where the panel floats over the page and would otherwise stay open on top of
     * the results you just navigated to. Off for the dashboard sidebar, which is a
     * persistent nav list that should keep showing where you are.
     */
    closeOnSelect?: boolean
}

export default function SimpleAccordion({ genre, closeOnSelect = false }: SimpleAccordionProps) {
    const [expanded, setExpanded] = useState(false)
    const [showAll, setShowAll] = useState(false)

    // Only navigation collapses the panel — "Browse all" expands the list in place.
    const handleSelect = () => {
        if (closeOnSelect) setExpanded(false)
    }

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
                            href={`/${categoryToSlug(category)}`}
                            onClick={handleSelect}
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
                    href='/'
                    onClick={handleSelect}
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
