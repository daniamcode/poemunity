import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PoemNotFound } from './PoemNotFound'

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PoemNotFound', () => {
    test('should render 404 error title', () => {
        renderWithRouter(<PoemNotFound />)
        expect(screen.getByText('Error - 404')).toBeInTheDocument()
    })

    test('should render error message', () => {
        renderWithRouter(<PoemNotFound />)
        expect(screen.getByText('Nothing to see here')).toBeInTheDocument()
    })

    test('should render link back to dashboard', () => {
        renderWithRouter(<PoemNotFound />)
        const link = screen.getByText('Back to Dashboard')
        expect(link).toBeInTheDocument()
        expect(link.closest('a')).toHaveAttribute('href', '/')
    })

    test('should apply correct CSS classes', () => {
        const { container } = renderWithRouter(<PoemNotFound />)
        expect(container.querySelector('.page-not-found__container')).toBeInTheDocument()
        expect(container.querySelector('.page-not-found__message')).toBeInTheDocument()
        expect(container.querySelector('.page-not-found__title')).toBeInTheDocument()
        expect(container.querySelector('.page-not-found__text')).toBeInTheDocument()
        expect(container.querySelector('.page-not-found__link')).toBeInTheDocument()
    })
})
