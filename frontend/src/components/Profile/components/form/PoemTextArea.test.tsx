import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PoemTextArea from './PoemTextArea'
import { PoemFormData } from '../../hooks/useProfileForm'

describe('PoemTextArea', () => {
    const mockUpdatePoemField = jest.fn()
    const mockPoem: PoemFormData = {
        content: 'Roses are red\nViolets are blue',
        fakeId: 'user123',
        title: 'My Poem',
        origin: 'user',
        category: 'love',
        likes: []
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render textarea with poem content', () => {
        render(<PoemTextArea poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        expect(textarea).toBeInTheDocument()
        expect(textarea).toHaveValue('Roses are red\nViolets are blue')
    })

    it('should call updatePoemField when content changes', async () => {
        const user = userEvent.setup()
        const emptyPoem = { ...mockPoem, content: '' }
        render(<PoemTextArea poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        await user.type(textarea, 'abc')

        // user.type() calls onChange for each character, verify it was called with content field
        expect(mockUpdatePoemField).toHaveBeenCalledWith('content', expect.any(String))
        expect(mockUpdatePoemField.mock.calls[0][0]).toBe('content')
    })

    it('should render with placeholder text', () => {
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        }

        render(<PoemTextArea poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        expect(textarea).toHaveAttribute('placeholder')
    })

    it('should be a required field', () => {
        render(<PoemTextArea poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        expect(textarea).toBeRequired()
    })

    it('should have correct name and id attributes', () => {
        render(<PoemTextArea poem={mockPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        expect(textarea).toHaveAttribute('name', 'poem')
        expect(textarea).toHaveAttribute('id', 'poem')
    })

    it('should handle typing in textarea', async () => {
        const user = userEvent.setup()
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        }

        render(<PoemTextArea poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        await user.type(textarea, 'test')

        // Verify the function was called with content field
        expect(mockUpdatePoemField).toHaveBeenCalledWith('content', expect.any(String))
    })

    it('should display empty textarea when content is empty', () => {
        const emptyPoem: PoemFormData = {
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        }

        render(<PoemTextArea poem={emptyPoem} updatePoemField={mockUpdatePoemField} />)

        const textarea = screen.getByRole('textbox')
        expect(textarea).toHaveValue('')
    })
})
