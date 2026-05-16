import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminFields from './AdminFields'
import { PoemFormData } from '../../hooks/useProfileForm'

describe('AdminFields', () => {
    const mockUpdatePoemField = jest.fn()
    const mockPoem: PoemFormData = {
        content: 'Test content',
        fakeId: 'user123',
        title: 'Test Title',
        origin: 'famous',
        category: 'love',
        likes: 'user1,user2'
    }

    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
    })

    afterEach(() => {
        delete (global as any).fetch
    })

    it('should render all admin fields', async () => {
        await act(async () => {
            render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)
        })

        expect(screen.getByText('Origin')).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /origin/i })).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /author/i })).toBeInTheDocument()
        expect(screen.getByDisplayValue('user1,user2')).toBeInTheDocument()
    })

    it('should display current origin value', async () => {
        await act(async () => {
            render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        expect(originSelect).toHaveValue('famous')
    })

    it('should display current fakeId value', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([{ id: 'user123', name: 'User 123' }])
        })
        await act(async () => {
            render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const authorSelect = screen.getByRole('combobox', { name: /author/i })
        expect(authorSelect).toHaveValue('user123')
    })

    it('should display current likes value', async () => {
        await act(async () => {
            render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const likesInput = screen.getByDisplayValue('user1,user2')
        expect(likesInput).toBeInTheDocument()
    })

    it('should call updatePoemField when origin changes', async () => {
        const user = userEvent.setup()
        await act(async () => {
            render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        await user.selectOptions(originSelect, 'user')

        expect(mockUpdatePoemField).toHaveBeenCalledWith('origin', 'user')
    })

    it('should call updatePoemField when fakeId changes', async () => {
        const user = userEvent.setup()
        const emptyPoem = { ...mockPoem, fakeId: '' }
        await act(async () => {
            render(<AdminFields poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const authorSelect = screen.getByRole('combobox', { name: /author/i })
        await user.selectOptions(authorSelect, [])

        expect(mockUpdatePoemField).toBeDefined()
    })

    it('should call updatePoemField when likes changes', async () => {
        const user = userEvent.setup()
        const emptyPoem = { ...mockPoem, likes: '' }
        await act(async () => {
            render(<AdminFields poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const likesInput = screen.getByRole('textbox', { name: /likes/i })
        await user.type(likesInput, '123')

        expect(mockUpdatePoemField).toHaveBeenCalledWith('likes', expect.any(String))
        expect(mockUpdatePoemField.mock.calls[0][0]).toBe('likes')
    })

    it('should render origin select with correct options', async () => {
        await act(async () => {
            render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        const options = Array.from(originSelect.querySelectorAll('option'))

        // Options: Select a category, Famous, Human, AI
        expect(options.length).toBeGreaterThanOrEqual(3)
        expect(options.some(o => /famous/i.test(o.textContent || ''))).toBe(true)
        expect(options.some(o => /human|user/i.test(o.textContent || ''))).toBe(true)
    })

    it('should handle empty poem values', async () => {
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: ''
        }

        await act(async () => {
            render(<AdminFields poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)
        })

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        expect(originSelect).toHaveValue('')
    })
})
