import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'
import {
    SEARCH_PLACEHOLDER,
    SEARCH_MIN_LENGTH,
    SEARCH_MIN_LENGTH_HINT
} from '../../../data/constants'

describe('SearchBar', () => {
    const renderBar = (props: Partial<React.ComponentProps<typeof SearchBar>> = {}) =>
        render(<SearchBar value='' onChange={jest.fn()} {...props} />)

    test('should render search icon and input field', () => {
        const { container } = renderBar()

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    test('should call onChange when user types', () => {
        const mockOnChange = jest.fn()
        renderBar({ onChange: mockOnChange })

        fireEvent.change(screen.getByLabelText(SEARCH_PLACEHOLDER), { target: { value: 'love' } })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('should render input with correct placeholder', () => {
        renderBar()

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toHaveAttribute('placeholder', SEARCH_PLACEHOLDER)
    })

    test('should render container with correct class', () => {
        const { container } = renderBar()

        expect(container.querySelector('.search-input__container')).toBeInTheDocument()
        expect(container.querySelector('.search-input__field')).toBeInTheDocument()
    })

    test('is controlled by the value prop', () => {
        renderBar({ value: 'shelley' })

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toHaveValue('shelley')
    })

    // The status region is what makes the minimum-length gate and the result
    // count perceivable without sight. A search box that silently ignores the
    // first keystroke is the actual anti-pattern the threshold risks creating.
    describe('status announcements', () => {
        const status = () => screen.getByRole('status')

        test('is a polite live region, so updates do not interrupt', () => {
            renderBar()

            expect(status()).toHaveAttribute('aria-live', 'polite')
        })

        test('describes the input, so the hint is read with the field', () => {
            renderBar()

            expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toHaveAttribute(
                'aria-describedby',
                status().getAttribute('id')
            )
        })

        test('announces the minimum-length hint below the threshold', () => {
            renderBar({ value: 'a'.repeat(SEARCH_MIN_LENGTH - 1) })

            expect(status()).toHaveTextContent(SEARCH_MIN_LENGTH_HINT)
        })

        test('says nothing when the box is empty', () => {
            renderBar({ value: '' })

            expect(status()).toHaveTextContent('')
        })

        test('treats a whitespace-only value as empty, not as below-threshold', () => {
            renderBar({ value: '   ' })

            expect(status()).toHaveTextContent('')
        })

        test('announces the result count once searching', () => {
            renderBar({ value: 'love', resultCount: 5 })

            expect(status()).toHaveTextContent('5 results')
        })

        test('uses the singular for exactly one result', () => {
            renderBar({ value: 'love', resultCount: 1 })

            expect(status()).toHaveTextContent('1 result')
        })

        test('announces zero results rather than staying silent', () => {
            renderBar({ value: 'love', resultCount: 0 })

            expect(status()).toHaveTextContent('0 results')
        })

        // Announcing "0 results" while the request is still in flight would be
        // a lie, and screen-reader users would act on it before the real answer
        // arrives.
        test('announces nothing while the count is unknown', () => {
            renderBar({ value: 'love', resultCount: undefined })

            expect(status()).toHaveTextContent('')
        })
    })
})
