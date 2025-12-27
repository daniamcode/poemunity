import { useState, useEffect } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import cx from 'classnames'
import './Header/Header'
import { Link } from 'react-router-dom'
import { CATEGORIES_TITLE, CATEGORIES, ALL } from '../data/constants'

interface SimpleAccordionProps {
    genre?: string
}

export default function SimpleAccordion({ genre }: SimpleAccordionProps) {
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        if (genre) {
            setExpanded(true)
        }
    }, [genre])

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    const isActiveCategory = (category: string) => {
        return genre?.toLowerCase() === category.toLowerCase()
    }

    return (
        <Accordion className='accordion' expanded={expanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1a-content'
                id='panel1a-header'
                onClick={toggleExpanded}
            >
                <div className='header__dropdown-categories-icon'></div>
                <p className='header__dropdown-categories'>{CATEGORIES_TITLE}</p>
            </AccordionSummary>
            <div>
                {CATEGORIES?.sort().map(category => (
                    <AccordionDetails key={category}>
                        <Link
                            className={cx('header__dropdown-subcategories', {
                                active: isActiveCategory(category)
                            })}
                            to={`/${category.toLowerCase()}`}
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
        </Accordion>
    )
}
