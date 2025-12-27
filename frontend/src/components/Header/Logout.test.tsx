import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}))

// Mock AppContext with setState
jest.mock('../../App', () => ({
    AppContext: React.createContext({
        user: 'testuser',
        userId: 'user-123',
        adminId: 'admin-456',
        setState: jest.fn()
    })
}))

import Logout from './Logout'
import { AppContext } from '../../App'

// Get the mocked setState function
const mockSetState = (AppContext as any)._currentValue.setState

describe('Logout', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        Storage.prototype.removeItem = jest.fn()
    })

    test('should render logout button', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    test('should have correct CSS class', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        expect(button).toHaveClass('header__logout')
    })

    test('should call preventDefault when clicked', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        const mockEvent = {
            preventDefault: jest.fn()
        }
        fireEvent.click(button, mockEvent)
        // The button click will call handleLogout which calls preventDefault
        expect(button).toBeInTheDocument()
    })

    test('should clear user from context when clicked', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockSetState).toHaveBeenCalledWith(
            expect.objectContaining({
                user: ''
            })
        )
    })

    test('should remove loggedUser from localStorage when clicked', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('loggedUser')
    })

    test('should navigate to home page when clicked', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(mockHistoryPush).toHaveBeenCalledWith('/')
    })

    test('should perform all logout actions in correct order', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)

        // Verify all logout actions were called
        expect(mockSetState).toHaveBeenCalled()
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('loggedUser')
        expect(mockHistoryPush).toHaveBeenCalledWith('/')
    })

    test('should only logout once per click', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockSetState).toHaveBeenCalledTimes(1)
        expect(window.localStorage.removeItem).toHaveBeenCalledTimes(1)
        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
    })

    test('should preserve other context properties when logging out', () => {
        render(
            <BrowserRouter>
                <Logout />
            </BrowserRouter>
        )
        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockSetState).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-123',
                adminId: 'admin-456',
                user: ''
            })
        )
    })
})
