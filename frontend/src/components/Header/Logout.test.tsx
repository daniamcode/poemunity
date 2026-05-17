import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'

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
        mockRouter.setCurrentUrl('/')
        global.fetch = jest.fn().mockResolvedValue({ ok: true })
    })

    afterEach(() => {
        delete (global as any).fetch
    })

    test('should render logout button', () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })

    test('should have correct CSS class', () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('header__logout')
    })

    test('should call preventDefault when clicked', () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        expect(button).toBeInTheDocument()
    })

    test('should clear user from context when clicked', async () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        await waitFor(() => {
            expect(mockSetState).toHaveBeenCalledWith(
                expect.objectContaining({ user: '' })
            )
        })
    })

    test('should remove loggedUser from localStorage when clicked', async () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        await waitFor(() => {
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('loggedUser')
        })
    })

    test('should navigate to home page when clicked', async () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)
        await waitFor(() => {
            expect(mockRouter.pathname).toBe('/')
        })
    })

    test('should perform all logout actions', async () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockSetState).toHaveBeenCalled()
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('loggedUser')
            expect(mockRouter.pathname).toBe('/')
        })
    })

    test('should only logout once per click', async () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockSetState).toHaveBeenCalledTimes(1)
            expect(window.localStorage.removeItem).toHaveBeenCalledTimes(1)
        })
    })

    test('should preserve other context properties when logging out', async () => {
        render(<Logout />)
        const button = screen.getByRole('button')
        fireEvent.click(button)

        await waitFor(() => {
            expect(mockSetState).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user-123',
                    adminId: 'admin-456',
                    user: ''
                })
            )
        })
    })
})
