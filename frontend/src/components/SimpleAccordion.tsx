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
    // DERIVED FROM THE PROP — NOT FROM AN EFFECT. This is the whole point of
    // the change, and the reason it is worth ~10KB on genre pages.
    //
    // Both flags used to start `false` and get corrected in a `useEffect`.
    // Effects do not run during server rendering, so the server always emitted
    // a collapsed panel holding only MUST_HAVE_CATEGORIES — and on the 109
    // genre pages outside that list the other 117 category links were added by
    // the browser AFTER hydration, i.e. absent from the HTML a crawler reads
    // before deciding when to render. They were already being sent to the
    // browser on those pages, so this moves them into the first response
    // instead of a second pass.
    //
    // Hydration-safe for the same reason the SSR-seeded lists are: the client's
    // FIRST render computes the identical values from the same prop, so markup
    // matches byte-for-byte and nothing flips. The effect below stays for
    // client-side navigations between genres — the header does not remount when
    // the route changes, so initial state alone would carry the old genre's
    // flags across.
    const showAllFor = (g?: string) =>
        Boolean(g) && !MUST_HAVE_CATEGORIES.some(c => categoryToSlug(c) === g)

    const [expanded, setExpanded] = useState(Boolean(genre))
    const [showAll, setShowAll] = useState(showAllFor(genre))

    // Only navigation collapses the panel — including "Browse all categories",
    // which used to expand the list in place and now navigates to /categories
    // so a crawler can follow it.
    const handleSelect = () => {
        if (closeOnSelect) setExpanded(false)
    }

    useEffect(() => {
        if (genre) {
            setExpanded(true)
            setShowAll(showAllFor(genre))
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
                    {/* A LINK, not a button. The old `<button onClick>` created
                        the target's only inbound path in the browser, which a
                        crawler never runs — so the 117 categories outside
                        MUST_HAVE had no server-rendered link anywhere on the
                        site. Mirrors AuthorsAccordion, which has always linked
                        its "browse all" to /authors. */}
                    <Link
                        className='header__dropdown-subcategories authors-accordion__browse-all'
                        href='/categories'
                        onClick={handleSelect}
                    >
                        {CATEGORIES_BROWSE_ALL}
                    </Link>
                </AccordionDetails>
            )}
        </Accordion>
    )
}
