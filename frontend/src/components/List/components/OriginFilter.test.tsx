import { render, screen, fireEvent } from '@testing-library/react'
import { OriginFilter } from './OriginFilter'

describe('OriginFilter', () => {
    test('should render with default value', () => {
        const mockOnChange = jest.fn()
        render(<OriginFilter value='all' onChange={mockOnChange} />)

        const select = screen.getByLabelText(/authors:/i) as HTMLSelectElement
        expect(select).toBeInTheDocument()
        expect(select.value).toBe('all')
    })

    test('should render all three options', () => {
        const mockOnChange = jest.fn()
        render(<OriginFilter value='all' onChange={mockOnChange} />)

        expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Famous' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Users' })).toBeInTheDocument()
    })

    test('should call onChange when selection changes', () => {
        const mockOnChange = jest.fn()
        render(<OriginFilter value='all' onChange={mockOnChange} />)

        const select = screen.getByLabelText(/authors:/i)
        fireEvent.change(select, { target: { value: 'user' } })

        expect(mockOnChange).toHaveBeenCalled()
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should display selected value', () => {
        const mockOnChange = jest.fn()
        render(<OriginFilter value='famous' onChange={mockOnChange} />)

        const select = screen.getByLabelText(/authors:/i) as HTMLSelectElement
        expect(select.value).toBe('famous')
    })

    test('should have correct select name and id', () => {
        const mockOnChange = jest.fn()
        render(<OriginFilter value='all' onChange={mockOnChange} />)

        const select = screen.getByLabelText(/authors:/i)
        expect(select).toHaveAttribute('name', 'origin')
        expect(select).toHaveAttribute('id', 'origin')
    })
})
