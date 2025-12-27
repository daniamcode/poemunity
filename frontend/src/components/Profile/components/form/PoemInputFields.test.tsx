import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PoemInputFields from './PoemInputFields'
import { PoemFormData } from '../../hooks/useProfileForm'

describe('PoemInputFields', () => {
    const mockUpdatePoemField = jest.fn()
    const mockPoem: PoemFormData = {
        content: 'Test content',
        fakeId: 'user123',
        title: 'My Poem',
        origin: 'user',
        category: 'love',
        likes: []
    }

    const mockPoemQuery = {
        item: {
            genre: 'love'
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render title input field', () => {
        render(<PoemInputFields poem={mockPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const titleInput = screen.getByPlaceholderText(/title/i)
        expect(titleInput).toBeInTheDocument()
        expect(titleInput).toHaveValue('My Poem')
    })

    it('should render category select field', () => {
        render(<PoemInputFields poem={mockPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const categorySelect = screen.getByRole('combobox')
        expect(categorySelect).toBeInTheDocument()
        expect(categorySelect).toHaveValue('love')
    })

    it('should call updatePoemField when title changes', async () => {
        const user = userEvent.setup()
        const emptyPoem = { ...mockPoem, title: '' }
        render(<PoemInputFields poem={emptyPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const titleInput = screen.getByPlaceholderText(/title/i)
        await user.type(titleInput, 'abc')

        // user.type() calls onChange for each character, verify it was called with title field
        expect(mockUpdatePoemField).toHaveBeenCalledWith('title', expect.any(String))
        expect(mockUpdatePoemField.mock.calls[0][0]).toBe('title')
    })

    it('should call updatePoemField when category changes', async () => {
        const user = userEvent.setup()
        render(<PoemInputFields poem={mockPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const categorySelect = screen.getByRole('combobox')
        await user.selectOptions(categorySelect, 'sad')

        expect(mockUpdatePoemField).toHaveBeenCalledWith('category', 'sad')
    })

    it('should display empty values when poem is empty', () => {
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        }

        render(<PoemInputFields poem={emptyPoem} poemQuery={null} updatePoemField={mockUpdatePoemField} />)

        const titleInput = screen.getByPlaceholderText(/title/i)
        const categorySelect = screen.getByRole('combobox')

        expect(titleInput).toHaveValue('')
        expect(categorySelect).toHaveValue('')
    })

    it('should mark title input as required', () => {
        render(<PoemInputFields poem={mockPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const titleInput = screen.getByPlaceholderText(/title/i)
        expect(titleInput).toBeRequired()
    })

    it('should mark category select as required', () => {
        render(<PoemInputFields poem={mockPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const categorySelect = screen.getByRole('combobox')
        expect(categorySelect).toBeRequired()
    })

    it('should render category options from CATEGORIES constant', () => {
        render(<PoemInputFields poem={mockPoem} poemQuery={mockPoemQuery} updatePoemField={mockUpdatePoemField} />)

        const categorySelect = screen.getByRole('combobox')
        const options = Array.from(categorySelect.querySelectorAll('option'))

        expect(options.length).toBeGreaterThan(1)
        expect(options[0]).toHaveTextContent(/select a category/i)
    })
})
