import { render, screen } from '@testing-library/react'
import { ListHeader } from './ListHeader'
import { CATEGORIES_TITLE_LABEL, SEARCH_PLACEHOLDER } from '../../../data/constants'

describe('ListHeader', () => {
    const mockProps = {
        origin: 'all',
        orderBy: 'Likes',
        onSearchChange: jest.fn(),
        onOriginChange: jest.fn(),
        onOrderChange: jest.fn()
    }

    test('should render all filter components', () => {
        render(<ListHeader {...mockProps} />)

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
        expect(screen.getByLabelText(/authors:/i)).toBeInTheDocument()
        expect(screen.getByTestId('order-select')).toBeInTheDocument()
    })

    test('should display genre title when genre prop is provided', () => {
        render(<ListHeader {...mockProps} genre='love' />)

        expect(screen.getByText(/love/i)).toBeInTheDocument()
        expect(screen.getByText(new RegExp(CATEGORIES_TITLE_LABEL, 'i'))).toBeInTheDocument()
    })

    test('should not display genre title when genre prop is not provided', () => {
        render(<ListHeader {...mockProps} />)

        expect(screen.queryByText(new RegExp(CATEGORIES_TITLE_LABEL, 'i'))).not.toBeInTheDocument()
    })

    test('should display genre in uppercase', () => {
        render(<ListHeader {...mockProps} genre='sad' />)

        expect(screen.getByText(/SAD/)).toBeInTheDocument()
    })

    test('should pass correct props to sub-components', () => {
        const { container } = render(<ListHeader {...mockProps} />)

        const originSelect = screen.getByLabelText(/authors:/i) as HTMLSelectElement
        const sortSelect = screen.getByTestId('order-select') as HTMLSelectElement

        expect(originSelect.value).toBe('all')
        expect(sortSelect.value).toBe('Likes')
    })

    test('should render with different origin and orderBy values', () => {
        render(<ListHeader {...mockProps} origin='user' orderBy='Date' />)

        const originSelect = screen.getByLabelText(/authors:/i) as HTMLSelectElement
        const sortSelect = screen.getByTestId('order-select') as HTMLSelectElement

        expect(originSelect.value).toBe('user')
        expect(sortSelect.value).toBe('Date')
    })

    test('should have list__intro class on container', () => {
        const { container } = render(<ListHeader {...mockProps} />)

        const introDiv = container.querySelector('.list__intro')
        expect(introDiv).toBeInTheDocument()
    })
})
