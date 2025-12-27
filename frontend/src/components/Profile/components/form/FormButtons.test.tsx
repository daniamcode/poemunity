import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormButtons from './FormButtons'
import { PoemFormData } from '../../hooks/useProfileForm'

describe('FormButtons', () => {
    const mockHandleReset = jest.fn()
    const mockHandleSend = jest.fn()
    const mockContext = {
        userId: 'user123',
        adminId: 'admin456'
    }

    const mockPoem: PoemFormData = {
        content: 'Test content',
        fakeId: 'user123',
        title: 'Test Title',
        origin: 'user',
        category: 'love',
        likes: []
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render reset and send buttons', () => {
        render(
            <FormButtons
                context={mockContext}
                poem={mockPoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })

    it('should call handleReset when reset button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <FormButtons
                context={mockContext}
                poem={mockPoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const resetButton = screen.getByRole('button', { name: /reset/i })
        await user.click(resetButton)

        expect(mockHandleReset).toHaveBeenCalledTimes(1)
    })

    it('should call handleSend when send button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <FormButtons
                context={mockContext}
                poem={mockPoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        await user.click(sendButton)

        expect(mockHandleSend).toHaveBeenCalledTimes(1)
    })

    it('should disable send button when title is missing', () => {
        const incompletePoem = { ...mockPoem, title: '' }

        render(
            <FormButtons
                context={mockContext}
                poem={incompletePoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).toBeDisabled()
    })

    it('should disable send button when category is missing', () => {
        const incompletePoem = { ...mockPoem, category: '' }

        render(
            <FormButtons
                context={mockContext}
                poem={incompletePoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).toBeDisabled()
    })

    it('should disable send button when content is missing', () => {
        const incompletePoem = { ...mockPoem, content: '' }

        render(
            <FormButtons
                context={mockContext}
                poem={incompletePoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).toBeDisabled()
    })

    it('should disable send button when admin user has no origin', () => {
        const adminContext = {
            userId: 'admin456',
            adminId: 'admin456'
        }
        const poemWithoutOrigin = { ...mockPoem, origin: '' }

        render(
            <FormButtons
                context={adminContext}
                poem={poemWithoutOrigin}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).toBeDisabled()
    })

    it('should enable send button when all required fields are filled for regular user', () => {
        render(
            <FormButtons
                context={mockContext}
                poem={mockPoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).not.toBeDisabled()
    })

    it('should enable send button when all required fields are filled for admin user', () => {
        const adminContext = {
            userId: 'admin456',
            adminId: 'admin456'
        }
        const adminPoem = { ...mockPoem, origin: 'famous' }

        render(
            <FormButtons
                context={adminContext}
                poem={adminPoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const sendButton = screen.getByRole('button', { name: /send/i })
        expect(sendButton).not.toBeDisabled()
    })

    it('should never disable reset button', () => {
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        }

        render(
            <FormButtons
                context={mockContext}
                poem={emptyPoem}
                handleReset={mockHandleReset}
                handleSend={mockHandleSend}
            />
        )

        const resetButton = screen.getByRole('button', { name: /reset/i })
        expect(resetButton).not.toBeDisabled()
    })
})
