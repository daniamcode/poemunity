import { render, screen, fireEvent } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import LoginButton from './LoginButton'

describe('LoginButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockRouter.setCurrentUrl('/')
    })

    test('should render login button', () => {
        render(<LoginButton />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    test('should have correct CSS class', () => {
        render(<LoginButton />)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('header__login')
    })

    test('should navigate to /login when clicked', () => {
        render(<LoginButton />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockRouter.pathname).toBe('/login')
    })

    test('should navigate to /login only once per click', () => {
        render(<LoginButton />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockRouter.pathname).toBe('/login')
    })

    test('should handle multiple clicks', () => {
        render(<LoginButton />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        fireEvent.click(button)
        fireEvent.click(button)
        expect(mockRouter.pathname).toBe('/login')
    })
})
