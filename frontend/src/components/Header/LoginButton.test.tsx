import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginButton from './LoginButton'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}))

describe('LoginButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should render login button', () => {
        render(
            <BrowserRouter>
                <LoginButton />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    test('should have correct CSS class', () => {
        render(
            <BrowserRouter>
                <LoginButton />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        expect(button).toHaveClass('header__login')
    })

    test('should navigate to /login when clicked', () => {
        render(
            <BrowserRouter>
                <LoginButton />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockHistoryPush).toHaveBeenCalledWith('/login')
    })

    test('should navigate to /login only once per click', () => {
        render(
            <BrowserRouter>
                <LoginButton />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })

    test('should handle multiple clicks', () => {
        render(
            <BrowserRouter>
                <LoginButton />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        fireEvent.click(button)
        fireEvent.click(button)
        expect(mockHistoryPush).toHaveBeenCalledTimes(3)
        expect(mockHistoryPush).toHaveBeenCalledWith('/login')
    })
})
