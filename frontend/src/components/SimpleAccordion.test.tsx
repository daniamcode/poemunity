import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SimpleAccordion from './SimpleAccordion'
import { CATEGORIES_TITLE, CATEGORIES, MUST_HAVE_CATEGORIES, ALL, CATEGORIES_BROWSE_ALL, categoryToSlug } from '../data/constants'

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('SimpleAccordion', () => {
    test('should render accordion with categories title', () => {
        renderWithRouter(<SimpleAccordion />)
        expect(screen.getByText(CATEGORIES_TITLE)).toBeInTheDocument()
    })

    test('should start with accordion collapsed when no genre provided', () => {
        const { container } = renderWithRouter(<SimpleAccordion />)
        const accordion = container.querySelector('.accordion')
        expect(accordion).not.toHaveClass('Mui-expanded')
    })

    test('should expand accordion when genre is provided', () => {
        const { container } = renderWithRouter(<SimpleAccordion genre='love' />)
        const accordion = container.querySelector('.accordion')
        expect(accordion).toHaveClass('Mui-expanded')
    })

    test('should toggle accordion expansion when clicked', () => {
        const { container } = renderWithRouter(<SimpleAccordion />)
        const accordion = container.querySelector('.accordion')

        expect(accordion).not.toHaveClass('Mui-expanded')

        const summary = screen.getByText(CATEGORIES_TITLE).closest('.MuiAccordionSummary-root')
        if (summary) fireEvent.click(summary)
        expect(accordion).toHaveClass('Mui-expanded')

        if (summary) fireEvent.click(summary)
        expect(accordion).not.toHaveClass('Mui-expanded')
    })

    test('should render only must-have categories by default', () => {
        renderWithRouter(<SimpleAccordion />)

        MUST_HAVE_CATEGORIES.forEach(category => {
            expect(screen.getByText(category)).toBeInTheDocument()
        })

        const nonMustHave = CATEGORIES.filter(c => !MUST_HAVE_CATEGORIES.includes(c))
        nonMustHave.forEach(category => {
            expect(screen.queryByText(category)).not.toBeInTheDocument()
        })
    })

    test('should render "Browse all categories" button when not showing all', () => {
        renderWithRouter(<SimpleAccordion />)
        expect(screen.getByText(CATEGORIES_BROWSE_ALL)).toBeInTheDocument()
    })

    test('should show all categories after clicking "Browse all categories"', () => {
        renderWithRouter(<SimpleAccordion />)

        fireEvent.click(screen.getByText(CATEGORIES_BROWSE_ALL))

        CATEGORIES.forEach(category => {
            expect(screen.getByText(category)).toBeInTheDocument()
        })
        expect(screen.queryByText(CATEGORIES_BROWSE_ALL)).not.toBeInTheDocument()
    })

    test('should auto-show all categories when active genre is not a must-have category', () => {
        renderWithRouter(<SimpleAccordion genre='anxiety' />)

        expect(screen.getByText('Anxiety')).toBeInTheDocument()
        expect(screen.queryByText(CATEGORIES_BROWSE_ALL)).not.toBeInTheDocument()
    })

    test('should render "ALL" link', () => {
        renderWithRouter(<SimpleAccordion />)
        expect(screen.getByText(ALL)).toBeInTheDocument()
    })

    test('should highlight active category when genre matches', () => {
        renderWithRouter(<SimpleAccordion genre='love' />)
        const loveLink = screen.getByText('Love').closest('a')
        expect(loveLink).toHaveClass('active')
    })

    test('should highlight active category when genre matches slug', () => {
        renderWithRouter(<SimpleAccordion genre='love' />)
        const loveLink = screen.getByText('Love').closest('a')
        expect(loveLink).toHaveClass('active')
    })

    test('should NOT highlight non-matching categories', () => {
        renderWithRouter(<SimpleAccordion genre='love' />)
        const deathLink = screen.getByText('Death').closest('a')
        expect(deathLink).not.toHaveClass('active')
    })

    test('should highlight "ALL" link when no genre is provided', () => {
        renderWithRouter(<SimpleAccordion />)
        const allLink = screen.getByText(ALL).closest('a')
        expect(allLink).toHaveClass('active')
    })

    test('should NOT highlight "ALL" link when genre is provided', () => {
        renderWithRouter(<SimpleAccordion genre='love' />)
        const allLink = screen.getByText(ALL).closest('a')
        expect(allLink).not.toHaveClass('active')
    })

    test('should render links with correct paths for must-have categories', () => {
        renderWithRouter(<SimpleAccordion />)

        MUST_HAVE_CATEGORIES.forEach(category => {
            const link = screen.getByText(category).closest('a')
            expect(link).toHaveAttribute('href', `/${categoryToSlug(category)}`)
        })
    })

    test('should render links with correct paths for all categories when expanded', () => {
        renderWithRouter(<SimpleAccordion />)
        fireEvent.click(screen.getByText(CATEGORIES_BROWSE_ALL))

        CATEGORIES.forEach(category => {
            const link = screen.getByText(category).closest('a')
            expect(link).toHaveAttribute('href', `/${categoryToSlug(category)}`)
        })
    })

    test('should render "ALL" link with correct path', () => {
        renderWithRouter(<SimpleAccordion />)
        const allLink = screen.getByText(ALL).closest('a')
        expect(allLink).toHaveAttribute('href', '/')
    })

    test('should apply correct CSS classes to category links', () => {
        renderWithRouter(<SimpleAccordion />)
        const categoryLink = screen.getByText(MUST_HAVE_CATEGORIES[0]).closest('a')
        expect(categoryLink).toHaveClass('header__dropdown-subcategories')
    })

    test('should render expand icon', () => {
        const { container } = renderWithRouter(<SimpleAccordion />)
        const expandIcon = container.querySelector('.MuiSvgIcon-root')
        expect(expandIcon).toBeInTheDocument()
    })

    test('should have correct aria attributes', () => {
        renderWithRouter(<SimpleAccordion />)
        const summary = screen.getByText(CATEGORIES_TITLE).closest('.MuiAccordionSummary-root')
        expect(summary).toHaveAttribute('aria-controls', 'panel1a-content')
        expect(summary).toHaveAttribute('id', 'panel1a-header')
    })

    test('should expand accordion when genre prop changes from undefined to defined', () => {
        const { container, rerender } = renderWithRouter(<SimpleAccordion />)
        const accordion = container.querySelector('.accordion')

        expect(accordion).not.toHaveClass('Mui-expanded')

        rerender(
            <BrowserRouter>
                <SimpleAccordion genre='love' />
            </BrowserRouter>
        )

        expect(accordion).toHaveClass('Mui-expanded')
    })

    test('should sort must-have categories alphabetically by default', () => {
        const { container } = renderWithRouter(<SimpleAccordion />)

        const categoryLinks = container.querySelectorAll('a.header__dropdown-subcategories')
        const categoryTexts = Array.from(categoryLinks)
            .slice(0, -1) // exclude the "All" link
            .map(link => link.textContent || '')

        const sortedMustHave = [...MUST_HAVE_CATEGORIES].sort()
        expect(categoryTexts).toEqual(sortedMustHave)
    })
})
