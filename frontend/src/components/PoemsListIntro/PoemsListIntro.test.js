import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PoemsListIntro from './PoemsListIntro'

describe('PoemsListIntro Component', () => {
    test('should render separator', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const separator = container.querySelector('.separator')
        expect(separator).toBeInTheDocument()
    })

    test('should render search icon', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const searchIcon = container.querySelector('svg[data-testid="SearchIcon"]')
        expect(searchIcon).toBeInTheDocument()
    })

    test('should render text field with correct label', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText('Search author')
        expect(textField).toBeInTheDocument()
    })

    test('should call onSearchChange when input value changes', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText('Search author')
        fireEvent.change(textField, { target: { value: 'test author' } })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(1)
        expect(mockOnSearchChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({
                    value: 'test author'
                })
            })
        )
    })

    test('should render with correct structure', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const listIntro = container.querySelector('.list__intro')
        const listSearch = container.querySelector('.list__search')

        expect(listIntro).toBeInTheDocument()
        expect(listSearch).toBeInTheDocument()
    })

    test('should render TextField with standard variant', () => {
        const mockOnSearchChange = jest.fn()
        const { container } = render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const input = container.querySelector('input')
        expect(input).toBeInTheDocument()
    })

    test('should handle multiple search changes', () => {
        const mockOnSearchChange = jest.fn()
        render(<PoemsListIntro onSearchChange={mockOnSearchChange} />)

        const textField = screen.getByLabelText('Search author')

        fireEvent.change(textField, { target: { value: 'author1' } })
        fireEvent.change(textField, { target: { value: 'author2' } })
        fireEvent.change(textField, { target: { value: 'author3' } })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(3)
    })
})
