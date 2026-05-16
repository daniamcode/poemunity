import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'
import { SEARCH_PLACEHOLDER } from '../../../data/constants'

describe('SearchBar', () => {
    test('should render search icon and input field', () => {
        const mockOnChange = jest.fn()
        const { container } = render(<SearchBar onChange={mockOnChange} />)

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    test('should call onChange when user types', () => {
        const mockOnChange = jest.fn()
        render(<SearchBar onChange={mockOnChange} />)

        const input = screen.getByLabelText(SEARCH_PLACEHOLDER)
        fireEvent.change(input, { target: { value: 'love' } })

        expect(mockOnChange).toHaveBeenCalled()
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should render input with correct placeholder', () => {
        const mockOnChange = jest.fn()
        render(<SearchBar onChange={mockOnChange} />)

        const input = screen.getByLabelText(SEARCH_PLACEHOLDER)
        expect(input).toHaveAttribute('placeholder', SEARCH_PLACEHOLDER)
    })

    test('should render container with correct class', () => {
        const mockOnChange = jest.fn()
        const { container } = render(<SearchBar onChange={mockOnChange} />)

        expect(container.querySelector('.search-input__container')).toBeInTheDocument()
        expect(container.querySelector('.search-input__field')).toBeInTheDocument()
    })
})
