import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PoemContent } from './PoemContent'
import { READ_MORE } from '../../../data/constants'

describe('PoemContent', () => {
    const mockProps = {
        poemId: 'poem-456',
        content: 'This is a beautiful poem about nature and love.'
    }

    const renderWithRouter = (component: React.ReactElement) => {
        return render(<BrowserRouter>{component}</BrowserRouter>)
    }

    test('should render poem content', () => {
        renderWithRouter(<PoemContent {...mockProps} />)

        expect(screen.getByText('This is a beautiful poem about nature and love.')).toBeInTheDocument()
    })

    test('should render "Read more" link', () => {
        renderWithRouter(<PoemContent {...mockProps} />)

        const readMoreLink = screen.getByText(READ_MORE)
        expect(readMoreLink).toBeInTheDocument()
        expect(readMoreLink).toHaveAttribute('href', '/detail/poem-456')
    })

    test('should have correct CSS classes', () => {
        const { container } = renderWithRouter(<PoemContent {...mockProps} />)

        expect(container.querySelector('.poem__content')).toBeInTheDocument()
        expect(container.querySelector('.poems__content')).toBeInTheDocument()
        expect(container.querySelector('.poems__read-more')).toBeInTheDocument()
    })

    test('should render different content correctly', () => {
        renderWithRouter(<PoemContent {...mockProps} content='Another poem content here' />)

        expect(screen.getByText('Another poem content here')).toBeInTheDocument()
    })

    test('should link to correct detail page for different poemId', () => {
        renderWithRouter(<PoemContent {...mockProps} poemId='different-poem-789' />)

        const readMoreLink = screen.getByText(READ_MORE)
        expect(readMoreLink).toHaveAttribute('href', '/detail/different-poem-789')
    })
})
