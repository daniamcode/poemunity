import React from 'react'
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
        expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
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

    test('should render title as h2 element', () => {
        render(<PoemContent poem={mockPoem} />)
        const title = screen.getByText('A Beautiful Poem')
        expect(title.tagName).toBe('H2')
    })
})
