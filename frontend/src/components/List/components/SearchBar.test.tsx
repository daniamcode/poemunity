import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'
import { SEARCH_PLACEHOLDER } from '../../../data/constants'

describe('SearchBar', () => {
    test('should render search icon and input field', () => {
        const mockOnChange = jest.fn()
        render(<SearchBar onChange={mockOnChange} />)

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
    })

    test('should call onChange when user types', () => {
        const mockOnChange = jest.fn()
        render(<SearchBar onChange={mockOnChange} />)

        const input = screen.getByLabelText(SEARCH_PLACEHOLDER)
        fireEvent.change(input, { target: { value: 'love' } })

        expect(mockOnChange).toHaveBeenCalled()
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should have correct styling for icon', () => {
        const mockOnChange = jest.fn()
        const { container } = render(<SearchBar onChange={mockOnChange} />)

        const icon = container.querySelector('svg')
        expect(icon).toHaveStyle({ fontSize: '40px', fill: '#4F5D73' })
    })

    test('should render separator', () => {
        const mockOnChange = jest.fn()
        const { container } = render(<SearchBar onChange={mockOnChange} />)

        const separator = container.querySelector('.separator')
        expect(separator).toBeInTheDocument()
    })
})
