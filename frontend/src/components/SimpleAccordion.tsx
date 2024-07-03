import { useState } from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import './Header.scss'
import { Link } from 'react-router-dom'
import { CATEGORIES_TITLE, CATEGORIES, ALL } from '../data/constants'

export default function SimpleAccordion() {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => {
    setExpanded(!expanded)
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
              className='header__dropdown-subcategories'
              to={`/${category.toLowerCase()}`}
              onClick={toggleExpanded}
            >
              {category}
            </Link>
          </AccordionDetails>
        ))}
      </div>
      <AccordionDetails>
        <Link
          className='header__dropdown-subcategories'
          to='/'
          onClick={toggleExpanded}
        >
          {ALL}
        </Link>
      </AccordionDetails>
    </Accordion>
  )
}
