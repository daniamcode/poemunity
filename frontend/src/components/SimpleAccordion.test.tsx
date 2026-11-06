import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SimpleAccordion from './SimpleAccordion'
import { CATEGORIES_TITLE, CATEGORIES, MUST_HAVE_CATEGORIES, ALL, CATEGORIES_BROWSE_ALL, categoryToSlug } from '../data/constants'

const renderWithRouter = (component: React.ReactElement) => {
    return render(component)
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

    test('should render "Browse all categories" as a link to the hub when not showing all', () => {
        renderWithRouter(<SimpleAccordion />)

        const hub = screen.getByText(CATEGORIES_BROWSE_ALL).closest('a')
        expect(hub).toHaveAttribute('href', '/categories')
    })

    test('reaches the rest through /categories, not by expanding in place', () => {
        renderWithRouter(<SimpleAccordion />)

        // The dropdown still shows only the must-have set. Expanding it
        // client-side was the behaviour this replaced — and rendering all 141
        // here would be the OTHER fix, one deliberately not taken because it
        // adds ~13KB to the HTML of every page on the site.
        expect(screen.queryByText('Fantasy')).not.toBeInTheDocument()
        expect(screen.getByText('Love')).toBeInTheDocument()
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

    test('should render links with correct paths for every category when the genre sits outside the must-have set', () => {
        // `showAll` is now reached only through the `genre` effect — clicking
        // "Browse all" navigates to /categories instead of expanding here.
        // Same rendering path, different trigger.
        renderWithRouter(<SimpleAccordion genre='fantasy' />)

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
                <SimpleAccordion genre='love' />
        )

        expect(accordion).toHaveClass('Mui-expanded')
    })

    // The header dropdown floats over the page, so leaving it open after a
    // category is picked covers the results you just navigated to. The dashboard
    // sidebar is a persistent nav list and must NOT collapse.
    describe('closeOnSelect', () => {
        const expand = (container: HTMLElement) => {
            const summary = screen.getByText(CATEGORIES_TITLE).closest('.MuiAccordionSummary-root')
            if (summary) fireEvent.click(summary)
            expect(container.querySelector('.accordion')).toHaveClass('Mui-expanded')
        }

        test('collapses after picking a category when enabled', () => {
            const { container } = renderWithRouter(<SimpleAccordion closeOnSelect />)
            expand(container)

            fireEvent.click(screen.getByText(MUST_HAVE_CATEGORIES[0]))

            expect(container.querySelector('.accordion')).not.toHaveClass('Mui-expanded')
        })

        test('collapses after picking "ALL" when enabled', () => {
            const { container } = renderWithRouter(<SimpleAccordion closeOnSelect />)
            expand(container)

            fireEvent.click(screen.getByText(ALL))

            expect(container.querySelector('.accordion')).not.toHaveClass('Mui-expanded')
        })

        test('"Browse all categories" navigates now, so it collapses like every other link', () => {
            const { container } = renderWithRouter(<SimpleAccordion closeOnSelect />)
            expand(container)

            // The old assertion here pinned the OPPOSITE — that this control
            // stays open — because it was a button that expanded the list
            // without going anywhere. It links to /categories now, so
            // `handleSelect` treats it like every other category link.
            fireEvent.click(screen.getByText(CATEGORIES_BROWSE_ALL))

            expect(container.querySelector('.accordion')).not.toHaveClass('Mui-expanded')
        })

        test('stays open after picking a category when disabled (dashboard sidebar)', () => {
            const { container } = renderWithRouter(<SimpleAccordion />)
            expand(container)

            fireEvent.click(screen.getByText(MUST_HAVE_CATEGORIES[0]))

            expect(container.querySelector('.accordion')).toHaveClass('Mui-expanded')
        })
    })

    test('should sort must-have categories alphabetically by default', () => {
        const { container } = renderWithRouter(<SimpleAccordion />)

        // Filtered by href rather than `slice(0, -1)`. That worked while the
        // last link was "All", but "Browse all categories" is an <a> now too,
        // so the trailing slice left "All" in the list and the test failed on
        // an extra entry instead of on ordering.
        const categoryLinks = Array.from(container.querySelectorAll('a.header__dropdown-subcategories'))
            .filter(link => {
                const href = link.getAttribute('href')
                return href !== '/' && href !== '/categories'
            })
        const categoryTexts = categoryLinks.map(link => link.textContent || '')

        const sortedMustHave = [...MUST_HAVE_CATEGORIES].sort()
        expect(categoryTexts).toEqual(sortedMustHave)
    })
})
