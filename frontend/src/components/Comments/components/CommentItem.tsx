import { useState } from 'react'
import Link from 'next/link'
import { Comment, Context } from '../../../typescript/interfaces'
import CommentForm from './CommentForm'

interface CommentItemProps {
    comment: Comment
    replies: Comment[]
    context: Context
    onDelete: (id: string) => Promise<void>
    onReply: (body: string) => Promise<void>
    styles: Record<string, string>
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AuthorAvatar({ name, picture, styles }: { name: string; picture?: string | null; styles: Record<string, string> }) {
    if (picture) {
        return <img className={styles.commentAvatar} src={picture} alt={name} />
    }
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    return (
        <span
            className={styles.commentAvatarInitials}
            style={{ background: `hsl(${hue}, 45%, 55%)` }}
        >
            {initials}
        </span>
    )
}

export default function CommentItem({ comment, replies, context, onDelete, onReply, styles }: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const isOwner = !!context.user && context.userId === comment.authorId
    const isAdmin = !!context.user && context.isAdmin
    const canDelete = isOwner || isAdmin

    const handleDelete = () => {
        setShowConfirm(true)
    }

    const confirmDelete = () => {
        setShowConfirm(false)
        onDelete(comment.id)
    }

    const cancelDelete = () => {
        setShowConfirm(false)
    }

    const handleReply = async (body: string) => {
        await onReply(body)
        setShowReplyForm(false)
    }

    return (
        <li className={styles.comment}>
            {showConfirm && (
                <div className={styles.confirmOverlay} role='dialog' aria-modal='true' aria-labelledby='confirm-title'>
                    <div className={styles.confirmBox}>
                        <h4 className={styles.confirmTitle} id='confirm-title'>Delete comment</h4>
                        <p className={styles.confirmMessage}>This action cannot be undone.</p>
                        <div className={styles.confirmActions}>
                            <button className={styles.confirmCancel} onClick={cancelDelete}>Cancel</button>
                            <button className={styles.confirmDelete} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.commentHeader}>
                <AuthorAvatar name={comment.authorName} picture={comment.authorPicture} styles={styles} />
                <div className={styles.commentMeta}>
                    {comment.authorSlug ? (
                        <Link href={`/authors/${comment.authorSlug}`} className={styles.commentAuthor}>
                            {comment.authorName}
                        </Link>
                    ) : (
                        <span className={styles.commentAuthor}>{comment.authorName}</span>
                    )}
                    <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
                </div>
                {canDelete && (
                    <button className={styles.commentDelete} onClick={handleDelete} aria-label='Delete comment'>
                        ×
                    </button>
                )}
            </div>

            <p className={styles.commentBody}>{comment.body}</p>

            <div className={styles.commentFooter}>
                {context.user && (
                    <button className={styles.commentReplyBtn} onClick={() => setShowReplyForm(v => !v)}>
                        Reply
                    </button>
                )}
            </div>

            {showReplyForm && (
                <CommentForm
                    onSubmit={handleReply}
                    placeholder='Write a reply…'
                    buttonLabel='Reply'
                    onCancel={() => setShowReplyForm(false)}
                    styles={styles}
                />
            )}

            {replies.length > 0 && (
                <ul className={styles.commentReplies}>
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            replies={[]}
                            context={context}
                            onDelete={onDelete}
                            onReply={onReply}
                            styles={styles}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}
