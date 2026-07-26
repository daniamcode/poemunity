import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()

    const baseProps = {
        title: 'Delete this poem?',
        message: 'This action cannot be undone.',
        onConfirm,
        onCancel
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders nothing when closed', () => {
        render(<ConfirmDialog open={false} {...baseProps} />)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('renders the title and message when open', () => {
        render(<ConfirmDialog open {...baseProps} />)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Delete this poem?')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    // The whole point of the component: neither button fires its callback until
    // the user actually clicks it. A render alone must NOT confirm anything.
    test('does not call onConfirm just by rendering', () => {
        render(<ConfirmDialog open {...baseProps} />)

        expect(onConfirm).not.toHaveBeenCalled()
    })

    test('calls onConfirm when the confirm button is clicked', () => {
        render(<ConfirmDialog open {...baseProps} />)

        fireEvent.click(screen.getByTestId('confirm-delete-poem'))

        expect(onConfirm).toHaveBeenCalledTimes(1)
        expect(onCancel).not.toHaveBeenCalled()
    })

    test('calls onCancel when the cancel button is clicked', () => {
        render(<ConfirmDialog open {...baseProps} />)

        fireEvent.click(screen.getByText('Cancel'))

        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    test('honours custom labels and confirm test id', () => {
        render(
            <ConfirmDialog
                open
                title='Remove account?'
                confirmLabel='Yes, remove'
                cancelLabel='Keep it'
                confirmTestId='confirm-remove-account'
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        )

        expect(screen.getByText('Yes, remove')).toBeInTheDocument()
        expect(screen.getByText('Keep it')).toBeInTheDocument()
        fireEvent.click(screen.getByTestId('confirm-remove-account'))
        expect(onConfirm).toHaveBeenCalledTimes(1)
    })
})
