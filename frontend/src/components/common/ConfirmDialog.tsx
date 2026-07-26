import React from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    /** Test id for the confirm button — defaults to the poem-delete id for back-compat. */
    confirmTestId?: string
    onConfirm: (event: React.SyntheticEvent) => void
    onCancel: () => void
}

// A single, portal-rendered confirmation modal for destructive actions. It exists
// so "confirm before you destroy data" is ONE tested unit that every caller shares,
// rather than a pattern each button re-implements (and can silently forget — as the
// detail-page delete once did, firing on the first click with no dialog).
export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    confirmTestId = 'confirm-delete-poem',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    if (!open || typeof document === 'undefined') {
        return null
    }

    return createPortal(
        <div
            className='poem__confirm-overlay'
            role='dialog'
            aria-modal='true'
            aria-labelledby='poem-confirm-title'
        >
            <div className='poem__confirm-box'>
                <p className='poem__confirm-title' id='poem-confirm-title'>{title}</p>
                {message && <p className='poem__confirm-message'>{message}</p>}
                <div className='poem__confirm-actions'>
                    <button
                        type='button'
                        className='poem__confirm-cancel'
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type='button'
                        className='poem__confirm-delete'
                        onClick={onConfirm}
                        data-testid={confirmTestId}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
