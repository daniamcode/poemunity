import { useContext } from 'react'
import Link from 'next/link'
import { AppContext } from '../../App'
import { useComments } from './useComments'
import CommentItem from './components/CommentItem'
import CommentForm from './components/CommentForm'
import styles from './Comments.module.scss'
import { manageError, manageSuccess } from '../../utils/notifications'

interface CommentsSectionProps {
    targetType: 'poem' | 'profile'
    targetId: string
}

export default function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
    const context = useContext(AppContext)
    const { comments, isLoading, error, addComment, deleteComment } = useComments(targetType, targetId)

    const topLevel = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => !!c.parentId)

    const handleAddComment = async (body: string, parentId?: string) => {
        try {
            await addComment(body, context.config, parentId)
            manageSuccess(parentId ? 'Reply posted' : 'Comment posted')
        } catch {
            manageError(parentId ? 'Failed to post reply' : 'Failed to post comment')
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

    return (
        <section className={styles.comments}>
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

            {context.user ? (
                <CommentForm
                    onSubmit={(body) => handleAddComment(body)}
                    placeholder='Add a comment…'
                    styles={styles}
                />
            ) : (
                <p className={styles.commentsLogin}>
                    <Link href='/login'>Log in</Link> to leave a comment.
                </p>
            )}
        </section>
    )
}
