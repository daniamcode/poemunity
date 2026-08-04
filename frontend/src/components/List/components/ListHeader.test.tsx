import { render, screen } from '@testing-library/react'
import { ListHeader } from './ListHeader'
import { CATEGORIES_TITLE_LABEL, SEARCH_PLACEHOLDER } from '../../../data/constants'

describe('ListHeader', () => {
    const mockProps = {
        origin: 'all',
        orderBy: 'Likes',
        searchValue: '',
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

    test('does NOT print the category — the page already says it twice', () => {
        // "Category: BEAUTY" used to sit in this row. The `h1` above reads
        // "52 Beauty poems" and the breadcrumb ends on "Beauty", so a third
        // copy competed with the search box and the two dropdowns beside it,
        // which are the controls somebody is actually reaching for.
        render(<ListHeader {...mockProps} />)

        expect(screen.queryByText(new RegExp(CATEGORIES_TITLE_LABEL, 'i'))).not.toBeInTheDocument()
        expect(screen.queryByText(/^Category:/i)).not.toBeInTheDocument()
    })

    test('should pass correct props to sub-components', () => {
        render(<ListHeader {...mockProps} />)

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
