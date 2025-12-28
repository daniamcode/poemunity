import { render, screen, fireEvent } from '@testing-library/react'
import { SortFilter } from './SortFilter'
import { ORDER_BY_DATE, ORDER_BY_LIKES, ORDER_BY_RANDOM, ORDER_BY_TITLE } from '../../../data/constants'

describe('SortFilter', () => {
    test('should render with default value', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_LIKES} onChange={mockOnChange} />)

        const select = screen.getByTestId('order-select') as HTMLSelectElement
        expect(select).toBeInTheDocument()
        expect(select.value).toBe(ORDER_BY_LIKES)
    })

    test('should render all four sort options', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_LIKES} onChange={mockOnChange} />)

        expect(screen.getByRole('option', { name: ORDER_BY_LIKES })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: ORDER_BY_DATE })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: ORDER_BY_RANDOM })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: ORDER_BY_TITLE })).toBeInTheDocument()
    })

    test('should call onChange when selection changes', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_LIKES} onChange={mockOnChange} />)

        const select = screen.getByTestId('order-select')
        fireEvent.change(select, { target: { value: ORDER_BY_DATE } })

        expect(mockOnChange).toHaveBeenCalled()
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should display selected value', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_TITLE} onChange={mockOnChange} />)

        const select = screen.getByTestId('order-select') as HTMLSelectElement
        expect(select.value).toBe(ORDER_BY_TITLE)
    })

    test('should have correct select name and id', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_LIKES} onChange={mockOnChange} />)

        const select = screen.getByTestId('order-select')
        expect(select).toHaveAttribute('name', 'sort')
        expect(select).toHaveAttribute('id', 'sort')
    })

    test('should have data-testid on select element', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_LIKES} onChange={mockOnChange} />)

        expect(screen.getByTestId('order-select')).toBeInTheDocument()
    })

    test('should have data-testid on all options', () => {
        const mockOnChange = jest.fn()
        render(<SortFilter value={ORDER_BY_LIKES} onChange={mockOnChange} />)

        const options = screen.getAllByTestId('select-option')
        expect(options).toHaveLength(4)
    })
})
