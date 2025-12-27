import { render, screen } from '@testing-library/react'
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
    })

    it('should render all admin fields', () => {
        render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        expect(screen.getByText('Origin')).toBeInTheDocument()
        expect(screen.getByRole('combobox', { name: /origin/i })).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: /author/i })).toBeInTheDocument()
        expect(screen.getByDisplayValue('user1,user2')).toBeInTheDocument()
    })

    it('should display current origin value', () => {
        render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        expect(originSelect).toHaveValue('famous')
    })

    it('should display current fakeId value', () => {
        render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const authorInput = screen.getByRole('textbox', { name: /author/i })
        expect(authorInput).toHaveValue('user123')
    })

    it('should display current likes value', () => {
        render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const likesInput = screen.getByDisplayValue('user1,user2')
        expect(likesInput).toBeInTheDocument()
    })

    it('should call updatePoemField when origin changes', async () => {
        const user = userEvent.setup()
        render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        await user.selectOptions(originSelect, 'user')

        expect(mockUpdatePoemField).toHaveBeenCalledWith('origin', 'user')
    })

    it('should call updatePoemField when fakeId changes', async () => {
        const user = userEvent.setup()
        const emptyPoem = { ...mockPoem, fakeId: '' }
        render(<AdminFields poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const authorInput = screen.getByRole('textbox', { name: /author/i })
        await user.type(authorInput, 'abc')

        // user.type() calls onChange for each character, verify it was called with fakeId field
        expect(mockUpdatePoemField).toHaveBeenCalledWith('fakeId', expect.any(String))
        expect(mockUpdatePoemField.mock.calls[0][0]).toBe('fakeId')
    })

    it('should call updatePoemField when likes changes', async () => {
        const user = userEvent.setup()
        const emptyPoem = { ...mockPoem, likes: '' }
        render(<AdminFields poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const likesInput = screen.getByRole('textbox', { name: /likes/i })
        await user.type(likesInput, '123')

        // user.type() calls onChange for each character, verify it was called with likes field
        expect(mockUpdatePoemField).toHaveBeenCalledWith('likes', expect.any(String))
        expect(mockUpdatePoemField.mock.calls[0][0]).toBe('likes')
    })

    it('should render origin select with correct options', () => {
        render(<AdminFields poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        const options = Array.from(originSelect.querySelectorAll('option'))

        expect(options).toHaveLength(3)
        expect(options[0].textContent).toMatch(/category/i)
        expect(options[1]).toHaveTextContent('Famous')
        expect(options[2]).toHaveTextContent('User')
    })

    it('should handle empty poem values', () => {
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: ''
        }

        render(<AdminFields poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const originSelect = screen.getByRole('combobox', { name: /origin/i })
        const authorInput = screen.getByRole('textbox', { name: /author/i })

        expect(originSelect).toHaveValue('')
        expect(authorInput).toHaveValue('')
    })
})
