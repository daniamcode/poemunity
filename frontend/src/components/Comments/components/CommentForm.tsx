import { useState, type FormEvent } from 'react'

interface CommentFormProps {
    onSubmit: (body: string) => Promise<void>
    placeholder?: string
    buttonLabel?: string
    onCancel?: () => void
    styles: Record<string, string>
}

export default function CommentForm({ onSubmit, placeholder = 'Write a comment…', buttonLabel = 'Post', onCancel, styles }: CommentFormProps) {
    const [body, setBody] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!body.trim()) return
        setIsSubmitting(true)
        try {
            await onSubmit(body.trim())
            setBody('')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
            <textarea
                className={styles.commentFormTextarea}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={placeholder}
                rows={3}
                maxLength={1000}
                disabled={isSubmitting}
            />
            <div className={styles.commentFormActions}>
                {onCancel && (
                    <button
                        type='button'
                        className={`${styles.commentFormBtn} ${styles.commentFormBtnCancel}`}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type='submit'
                    className={`${styles.commentFormBtn} ${styles.commentFormBtnSubmit}`}
                    disabled={!body.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Posting…' : buttonLabel}
                </button>
            </div>
        </form>
    )
}
