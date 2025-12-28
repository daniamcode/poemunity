import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SimpleAccordion from './SimpleAccordion'
import { CATEGORIES_TITLE, CATEGORIES, ALL } from '../data/constants'

// Wrapper with Router for Link components
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

        // Initially not expanded
        expect(accordion).not.toHaveClass('Mui-expanded')

        // Click to expand
        const summary = screen.getByText(CATEGORIES_TITLE).closest('.MuiAccordionSummary-root')
        if (summary) {
            fireEvent.click(summary)
        }

        // Should now be expanded
        expect(accordion).toHaveClass('Mui-expanded')

        // Click again to collapse
        if (summary) {
            fireEvent.click(summary)
        }

        // Should be collapsed again
        expect(accordion).not.toHaveClass('Mui-expanded')
    })

    test('should render all categories from CATEGORIES constant', () => {
        renderWithRouter(<SimpleAccordion />)

        CATEGORIES.forEach(category => {
            expect(screen.getByText(category)).toBeInTheDocument()
        })
    })

    test('should render "ALL" link', () => {
        renderWithRouter(<SimpleAccordion />)
        expect(screen.getByText(ALL)).toBeInTheDocument()
    })

    test('should highlight active category when genre matches', () => {
        const testGenre = 'love'
        renderWithRouter(<SimpleAccordion genre={testGenre} />)

        const loveLink = screen.getByText('Love').closest('a')
        expect(loveLink).toHaveClass('active')
    })

    test('should highlight active category case-insensitively', () => {
        const testGenre = 'LOVE'
        renderWithRouter(<SimpleAccordion genre={testGenre} />)

        const loveLink = screen.getByText('Love').closest('a')
        expect(loveLink).toHaveClass('active')
    })

    test('should NOT highlight non-matching categories', () => {
        const testGenre = 'love'
        renderWithRouter(<SimpleAccordion genre={testGenre} />)

        const sadLink = screen.getByText('Sad').closest('a')
        expect(sadLink).not.toHaveClass('active')
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

    test('should render links with correct paths for categories', () => {
        renderWithRouter(<SimpleAccordion />)

        CATEGORIES.forEach(category => {
            const link = screen.getByText(category).closest('a')
            expect(link).toHaveAttribute('href', `/${category.toLowerCase()}`)
        })
    })

    test('should render "ALL" link with correct path', () => {
        renderWithRouter(<SimpleAccordion />)

        const allLink = screen.getByText(ALL).closest('a')
        expect(allLink).toHaveAttribute('href', '/')
    })

    test('should apply correct CSS classes to category links', () => {
        renderWithRouter(<SimpleAccordion />)

        const categoryLink = screen.getByText(CATEGORIES[0]).closest('a')
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

        // Initially collapsed
        expect(accordion).not.toHaveClass('Mui-expanded')

        // Rerender with genre
        rerender(
            <BrowserRouter>
                <SimpleAccordion genre='love' />
            </BrowserRouter>
        )

        // Should now be expanded
        expect(accordion).toHaveClass('Mui-expanded')
    })

    test('should sort categories alphabetically', () => {
        const { container } = renderWithRouter(<SimpleAccordion />)

        const categoryLinks = container.querySelectorAll('.header__dropdown-subcategories')
        const categoryTexts = Array.from(categoryLinks)
            .slice(0, -1) // Exclude the "ALL" link at the end
            .map(link => link.textContent || '')

        const sortedCategories = [...CATEGORIES].sort()
        expect(categoryTexts).toEqual(sortedCategories)
    })
})
