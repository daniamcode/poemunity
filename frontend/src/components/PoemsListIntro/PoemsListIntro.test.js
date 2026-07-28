import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PoemsListIntro from './PoemsListIntro'
import { SEARCH_PLACEHOLDER } from '../../data/constants'

describe('PoemsListIntro Component', () => {
    test('should render list__intro container', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro searchValue='' onSearchChange={mockOnSearchChange} />)

        expect(container.querySelector('.list__intro')).toBeInTheDocument()
    })

    test('should render search icon', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro searchValue='' onSearchChange={mockOnSearchChange} />)

        const searchIcon = container.querySelector('svg')
        expect(searchIcon).toBeInTheDocument()
    })

    test('should render text field with correct label', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro searchValue='' onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText(SEARCH_PLACEHOLDER)
        expect(textField).toBeInTheDocument()
    })

    test('should call onSearchChange when input value changes', () => {
        // The input is controlled by searchValue, so React resets the DOM node
        // right after the handler runs. Read the typed text inside the handler
        // rather than off the event afterwards, where it is already gone.
        const typed = []
        const mockOnSearchChange = jest.fn(event => typed.push(event.target.value))
        render(<PoemsListIntro searchValue='' onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText(SEARCH_PLACEHOLDER)
        fireEvent.change(textField, { target: { value: 'test author' } })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(1)
        expect(typed).toEqual(['test author'])
    })

    test('should render input element', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro searchValue='' onSearchChange={mockOnSearchChange} />)

        expect(container.querySelector('input')).toBeInTheDocument()
    })

    test('should handle multiple search changes', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro searchValue='' onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText(SEARCH_PLACEHOLDER)

        fireEvent.change(textField, { target: { value: 'author1' } })
        fireEvent.change(textField, { target: { value: 'author2' } })
        fireEvent.change(textField, { target: { value: 'author3' } })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(3)
    })
})
