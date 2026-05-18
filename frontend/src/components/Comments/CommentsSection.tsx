import { useContext } from 'react'
import { AppContext } from '../../App'
import { useComments } from './useComments'
import CommentItem from './components/CommentItem'
import CommentForm from './components/CommentForm'
import styles from './Comments.module.scss'

interface CommentsSectionProps {
    targetType: 'poem' | 'profile'
    targetId: string
}

export default function CommentsSection({ targetType, targetId }: CommentsSectionProps) {
    const context = useContext(AppContext)
    const { comments, isLoading, error, addComment, deleteComment } = useComments(targetType, targetId)

    const topLevel = comments.filter(c => !c.parentId)
    const replies = comments.filter(c => !!c.parentId)

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
                            onDelete={(id) => deleteComment(id, context.config)}
                            onReply={(body) => addComment(body, context.config, comment.id)}
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
                    onSubmit={(body) => addComment(body, context.config)}
                    placeholder='Add a comment…'
                    styles={styles}
                />
            ) : (
                <p className={styles.commentsLogin}>
                    <a href='/login'>Log in</a> to leave a comment.
                </p>
            )}
        </section>
    )
}
