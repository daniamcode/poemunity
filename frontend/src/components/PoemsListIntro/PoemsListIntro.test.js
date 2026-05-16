import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PoemsListIntro from './PoemsListIntro'
import { SEARCH_PLACEHOLDER } from '../../data/constants'

describe('PoemsListIntro Component', () => {
    test('should render list__intro container', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        expect(container.querySelector('.list__intro')).toBeInTheDocument()
    })

    test('should render search icon', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const searchIcon = container.querySelector('svg')
        expect(searchIcon).toBeInTheDocument()
    })

    test('should render text field with correct label', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText(SEARCH_PLACEHOLDER)
        expect(textField).toBeInTheDocument()
    })

    test('should call onSearchChange when input value changes', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText(SEARCH_PLACEHOLDER)
        fireEvent.change(textField, { target: { value: 'test author' } })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(1)
        expect(mockOnSearchChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({ value: 'test author' })
            })
        )
    })

    test('should render input element', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        expect(container.querySelector('input')).toBeInTheDocument()
    })

    test('should handle multiple search changes', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText(SEARCH_PLACEHOLDER)

        fireEvent.change(textField, { target: { value: 'author1' } })
        fireEvent.change(textField, { target: { value: 'author2' } })
        fireEvent.change(textField, { target: { value: 'author3' } })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(3)
    })
})
