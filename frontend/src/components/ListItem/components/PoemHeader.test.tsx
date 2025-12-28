import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PoemHeader } from './PoemHeader'

describe('PoemHeader', () => {
    const mockProps = {
        poemId: 'poem-123',
        title: 'Test Poem Title',
        author: 'Test Author',
        picture: 'https://example.com/avatar.jpg',
        date: '2024-01-15T10:30:00.000Z'
    }

    const renderWithRouter = (component: React.ReactElement) => {
        return render(<BrowserRouter>{component}</BrowserRouter>)
    }

    test('should render poem title as a link', () => {
        renderWithRouter(<PoemHeader {...mockProps} />)

        const titleLink = screen.getByText('Test Poem Title')
        expect(titleLink).toBeInTheDocument()
        expect(titleLink).toHaveAttribute('href', '/detail/poem-123')
    })

    test('should render author name', () => {
        renderWithRouter(<PoemHeader {...mockProps} />)

        expect(screen.getByText('Test Author')).toBeInTheDocument()
    })

    test('should render author picture', () => {
        renderWithRouter(<PoemHeader {...mockProps} />)

        const img = screen.getByAltText('Test Author')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    test('should render formatted date', () => {
        renderWithRouter(<PoemHeader {...mockProps} />)

        expect(screen.getByText(/01\/15\/2024 \d{2}:\d{2}h/)).toBeInTheDocument()
    })

    test('should have correct CSS classes', () => {
        const { container } = renderWithRouter(<PoemHeader {...mockProps} />)

        expect(container.querySelector('.poem__title')).toBeInTheDocument()
        expect(container.querySelector('.poem__author-container')).toBeInTheDocument()
        expect(container.querySelector('.poem__picture')).toBeInTheDocument()
        expect(container.querySelector('.poem__author')).toBeInTheDocument()
        expect(container.querySelector('.poem__date')).toBeInTheDocument()
    })

    test('should format date correctly for different dates', () => {
        const { container } = renderWithRouter(<PoemHeader {...mockProps} date='2023-12-25T15:45:30.000Z' />)

        const dateElement = container.querySelector('.poem__date')
        expect(dateElement).toBeInTheDocument()
        expect(dateElement?.textContent).toMatch(/12\/25\/2023 \d{2}:\d{2}h/)
    })
})
