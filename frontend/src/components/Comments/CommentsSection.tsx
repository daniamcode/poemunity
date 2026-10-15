import { useContext, useState } from 'react'
import Link from 'next/link'
import { AppContext } from '../../App'
import { useComments } from './useComments'
import CommentItem from './components/CommentItem'
import CommentForm from './components/CommentForm'
import styles from './Comments.module.scss'
import { manageError, manageSuccess } from '../../utils/notifications'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

/** Anchor targeted by the comments icon, from a list or from the poem itself. */
export const COMMENTS_ANCHOR = 'comments'

interface CommentsSectionProps {
    targetType: 'poem' | 'profile'
    targetId: string
}

export default function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
    const context = useContext(AppContext)
    const { comments, isLoading, error, addComment, deleteComment } = useComments(targetType, targetId)
    const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')

    const topLevel = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => !!c.parentId)

    const isUnverified = Boolean(context.user && context.emailVerified === false && !context.isAdmin)

    const handleResendVerification = async () => {
        if (resendState === 'sending') return
        setResendState('sending')
        try {
            await API({}, {}).post(API_ENDPOINTS.VERIFY_RESEND)
        } catch {
            // The endpoint is intentionally generic
        }
        setResendState('sent')
    }

    const handleAddComment = async (body: string, parentId?: string) => {
        try {
            await addComment(body, context.config, parentId)
            manageSuccess(parentId ? 'Reply posted' : 'Comment posted')
        } catch (err: any) {
            if (err?.response?.data?.code === 'EMAIL_UNVERIFIED') {
                manageError(err.response.data.error || 'Please verify your email address before commenting.')
            } else {
                manageError(parentId ? 'Failed to post reply' : 'Failed to post comment')
            }
        }
    }

    const handleDeleteComment = async (id: string) => {
        try {
            await deleteComment(id, context.config)
            manageSuccess('Comment deleted')
        } catch {
            manageError('Failed to delete comment')
        }
    }

    // The three states of the composer area. A function with early returns,
    // not nested ternaries (lint forbids those, and each branch addresses a
    // different reader: signed out, signed in unverified, ready to write).
    const renderComposer = () => {
        if (!context.user) {
            return (
                <p className={styles.commentsLogin}>
                    <Link href='/login'>Log in</Link> to leave a comment.
                </p>
            )
        }

        if (isUnverified) {
            return (
                <div className={styles.commentsUnverified} role='status'>
                    <p className={styles.commentsUnverifiedText}>
                        Please verify your email address to leave a comment.
                    </p>
                    {resendState === 'sent'
                        ? (
                            <span className={styles.commentsUnverifiedSent}>Verification email sent.</span>
                            )
                        : (
                            <button
                                type='button'
                                className={styles.commentsUnverifiedButton}
                                onClick={handleResendVerification}
                                disabled={resendState === 'sending'}
                            >
                                {resendState === 'sending' ? 'Sending…' : 'Resend verification link'}
                            </button>
                            )}
                </div>
            )
        }

        return (
            <CommentForm
                onSubmit={(body) => handleAddComment(body)}
                placeholder='Add a comment…'
                styles={styles}
            />
        )
    }

    return (
        // The comments icon on every poem card links here. The id is the anchor
        // it targets, so it has to stay in sync with COMMENTS_ANCHOR.
        <section id={COMMENTS_ANCHOR} className={styles.comments}>
            <h3 className={styles.commentsTitle}>
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h3>

            {error && <p className={styles.commentsError}>{error}</p>}

            {isLoading ? (
                <p className={styles.commentsLoading}>Loading comments…</p>
            ) : (
                <ul className={styles.commentsList}>
                    {topLevel.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            replies={replies.filter(r => r.parentId === comment.id)}
                            context={context}
                            onDelete={(id) => handleDeleteComment(id)}
                            onReply={(body) => handleAddComment(body, comment.id)}
                            styles={styles}
                        />
                    ))}
                    {topLevel.length === 0 && (
                        <p className={styles.commentsEmpty}>No comments yet. Be the first!</p>
                    )}
                </ul>
            )}

            {renderComposer()}
        </section>
    )
}
