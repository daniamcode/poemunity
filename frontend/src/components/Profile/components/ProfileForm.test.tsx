import { render, screen } from '@testing-library/react'
import ProfileForm from './ProfileForm'
import { PoemFormData } from '../hooks/useProfileForm'

// Mock child components
jest.mock('./form/AdminFields', () => {
    return function AdminFields() {
        return <div data-testid='admin-fields'>Admin Fields</div>
    }
})

jest.mock('./form/PoemInputFields', () => {
    return function PoemInputFields() {
        return <div data-testid='poem-input-fields'>Poem Input Fields</div>
    }
})

jest.mock('./form/PoemTextArea', () => {
    return function PoemTextArea() {
        return <div data-testid='poem-textarea'>Poem Text Area</div>
    }
})

jest.mock('./form/FormButtons', () => {
    return function FormButtons() {
        return <div data-testid='form-buttons'>Form Buttons</div>
    }
})

describe('ProfileForm', () => {
    const mockUpdatePoemField = jest.fn()
    const mockHandleSend = jest.fn()
    const mockHandleReset = jest.fn()

    const mockPoem: PoemFormData = {
        content: 'Test content',
        fakeId: 'user123',
        title: 'Test Title',
        origin: 'user',
        category: 'love',
        likes: []
    }

    const mockPoemQuery = {
        item: {
            genre: 'love'
        }
    }

    const regularUserContext = {
        userId: 'user123',
        adminId: 'admin456',
        elementToEdit: ''
    }

    const adminUserContext = {
        userId: 'admin456',
        adminId: 'admin456',
        elementToEdit: ''
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render form with all required components for regular user', () => {
        render(
            <ProfileForm
                context={regularUserContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(screen.getByTestId('poem-input-fields')).toBeInTheDocument()
        expect(screen.getByTestId('poem-textarea')).toBeInTheDocument()
        expect(screen.getByTestId('form-buttons')).toBeInTheDocument()
        expect(screen.queryByTestId('admin-fields')).not.toBeInTheDocument()
    })

    it('should render admin fields when user is admin', () => {
        render(
            <ProfileForm
                context={adminUserContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(screen.getByTestId('admin-fields')).toBeInTheDocument()
    })

    it('should not render admin fields when user is not admin', () => {
        render(
            <ProfileForm
                context={regularUserContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(screen.queryByTestId('admin-fields')).not.toBeInTheDocument()
    })

    it('should display "Insert" subtitle when not editing', () => {
        render(
            <ProfileForm
                context={regularUserContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(screen.getByText(/insert a poem/i)).toBeInTheDocument()
    })

    it('should display "Modify" subtitle when editing', () => {
        const editingContext = { ...regularUserContext, elementToEdit: 'poem123' }

        render(
            <ProfileForm
                context={editingContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()
    })

    it('should render form element', () => {
        const { container } = render(
            <ProfileForm
                context={regularUserContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(container.querySelector('form')).toBeInTheDocument()
    })

    it('should have correct CSS classes', () => {
        const { container } = render(
            <ProfileForm
                context={regularUserContext}
                poem={mockPoem}
                updatePoemField={mockUpdatePoemField}
                poemQuery={mockPoemQuery}
                handleSend={mockHandleSend}
                handleReset={mockHandleReset}
            />
        )

        expect(container.querySelector('.profile__personal-data')).toBeInTheDocument()
        expect(container.querySelector('.profile__insert-poem')).toBeInTheDocument()
        expect(container.querySelector('.profile__insert-poem-form')).toBeInTheDocument()
        expect(container.querySelector('.profile__insert-poem-inputs')).toBeInTheDocument()
    })
})
