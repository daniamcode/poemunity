import { render, screen } from '@testing-library/react'
import { PoemContent } from './PoemContent'
import { Poem } from '../../../typescript/interfaces'

describe('PoemContent', () => {
    const mockPoem: Poem = {
        id: 'poem-123',
        author: 'John Doe',
        date: '2024-01-15T10:30:00.000Z',
        genre: 'love',
        likes: ['user1', 'user2'],
        picture: 'https://example.com/avatar.jpg',
        poem: 'This is a beautiful poem\nWith multiple lines\nOf lovely verse',
        title: 'A Beautiful Poem',
        userId: 'user-456'
    }

    test('should render poem title', () => {
        render(<PoemContent poem={mockPoem} />)
        expect(screen.getByText('A Beautiful Poem')).toBeInTheDocument()
    })

    test('should render poem author', () => {
        render(<PoemContent poem={mockPoem} />)
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    test('should render author picture with correct src and alt', () => {
        render(<PoemContent poem={mockPoem} />)
        const image = screen.getByAltText('John Doe')
        expect(image).toBeInTheDocument()
        // Through Next's optimizer now — a 550x412 portrait is no longer
        // downloaded whole to be drawn at 44x44.
        const src = image.getAttribute('src') || ''
        expect(src).toContain('/_next/image')
        expect(src).toContain(encodeURIComponent('https://example.com/avatar.jpg'))
    })

    test('should render poem content', () => {
        render(<PoemContent poem={mockPoem} />)
        expect(screen.getByText(/This is a beautiful poem/)).toBeInTheDocument()
    })

    test('should render formatted date', () => {
        render(<PoemContent poem={mockPoem} />)
        // Date format is MM/dd/yyyy HH:mm'h' but may vary based on timezone
        expect(screen.getByText(/01\/15\/2024 \d{2}:\d{2}h/)).toBeInTheDocument()
    })

    test('should apply correct CSS classes', () => {
        const { container } = render(<PoemContent poem={mockPoem} />)
        expect(container.querySelector('.poem__title')).toBeInTheDocument()
        expect(container.querySelector('.poem__author-container')).toBeInTheDocument()
        expect(container.querySelector('.poem__picture')).toBeInTheDocument()
        expect(container.querySelector('.poem__author')).toBeInTheDocument()
        expect(container.querySelector('.poem__date')).toBeInTheDocument()
        expect(container.querySelector('.poem__content')).toBeInTheDocument()
    })

    test('should handle empty poem content gracefully', () => {
        const emptyPoem: Poem = {
            ...mockPoem,
            poem: ''
        }
        const { container } = render(<PoemContent poem={emptyPoem} />)
        const content = container.querySelector('.poem__content')
        expect(content).toBeInTheDocument()
        expect(content?.textContent).toBe('')
    })

    // On a poem's own page the title IS the top-level heading. It was an h2
    // with no h1 anywhere above it, leaving the page's most important element
    // outranked by nothing at all.
    test('renders the title as the page h1', () => {
        render(<PoemContent poem={mockPoem} />)

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A Beautiful Poem')
    })
})
