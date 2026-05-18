import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommentForm from './CommentForm'

const styles: Record<string, string> = {}

describe('CommentForm', () => {
    const setup = (props: Partial<React.ComponentProps<typeof CommentForm>> = {}) => {
        const onSubmit = jest.fn().mockResolvedValue(undefined)
        const onCancel = jest.fn()
        render(
            <CommentForm
                onSubmit={onSubmit}
                styles={styles}
                {...props}
                onCancel={props.onCancel ?? onCancel}
            />
        )
        return { onSubmit, onCancel }
    }

    describe('initial state', () => {
        test('renders the textarea', () => {
            setup()
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        test('uses provided placeholder', () => {
            setup({ placeholder: 'Write something…' })
            expect(screen.getByPlaceholderText('Write something…')).toBeInTheDocument()
        })

        test('submit button is disabled when textarea is empty', () => {
            setup()
            expect(screen.getByRole('button', { name: /post/i })).toBeDisabled()
        })

        test('submit button becomes enabled when text is entered', () => {
            setup()
            fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } })
            expect(screen.getByRole('button', { name: /post/i })).toBeEnabled()
        })
    })

    describe('submission', () => {
        test('calls onSubmit with the entered body', async () => {
            const { onSubmit } = setup()
            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: 'My comment' } })
            fireEvent.submit(textarea.closest('form')!)
            await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('My comment'))
        })

        test('clears the textarea after successful submit', async () => {
            setup()
            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: 'My comment' } })
            fireEvent.submit(textarea.closest('form')!)
            await waitFor(() => expect(textarea).toHaveValue(''))
        })

        test('shows "Posting…" while submitting', async () => {
            let resolve: () => void
            const onSubmit = jest.fn().mockReturnValue(new Promise<void>(r => { resolve = r }))
            render(<CommentForm onSubmit={onSubmit} styles={styles} />)

            fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } })
            fireEvent.submit(screen.getByRole('textbox').closest('form')!)

            expect(await screen.findByText('Posting…')).toBeInTheDocument()
            resolve!()
        })

        test('disables textarea while submitting', async () => {
            let resolve: () => void
            const onSubmit = jest.fn().mockReturnValue(new Promise<void>(r => { resolve = r }))
            render(<CommentForm onSubmit={onSubmit} styles={styles} />)

            fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } })
            fireEvent.submit(screen.getByRole('textbox').closest('form')!)

            expect(screen.getByRole('textbox')).toBeDisabled()
            resolve!()
        })

        test('does not call onSubmit when body is only whitespace', () => {
            const { onSubmit } = setup()
            fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } })
            fireEvent.submit(screen.getByRole('textbox').closest('form')!)
            expect(onSubmit).not.toHaveBeenCalled()
        })

        test('uses custom button label', () => {
            setup({ buttonLabel: 'Reply' })
            expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument()
        })
    })

    describe('cancel button', () => {
        test('shows Cancel button when onCancel is provided', () => {
            setup({ onCancel: jest.fn() })
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
        })

        test('calls onCancel when Cancel is clicked', () => {
            const onCancel = jest.fn()
            setup({ onCancel })
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
            expect(onCancel).toHaveBeenCalledTimes(1)
        })

        test('does not show Cancel button when onCancel is not provided', () => {
            render(<CommentForm onSubmit={jest.fn().mockResolvedValue(undefined)} styles={styles} />)
            expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
        })
    })
})
