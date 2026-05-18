import { useState, useEffect, useCallback } from 'react'
import API from '../../redux/actions/axiosInstance'
import { Comment } from '../../typescript/interfaces'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'

export function useComments(targetType: 'poem' | 'profile', targetId: string) {
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchComments = useCallback(async () => {
        if (!targetId) return
        setIsLoading(true)
        setError(null)
        try {
            const api = API({}, {})
            const res = await api.get(
                `${API_ENDPOINTS.COMMENTS}?targetType=${targetType}&targetId=${targetId}`
            )
            setComments(res.data)
        } catch {
            setError('Failed to load comments')
        } finally {
            setIsLoading(false)
        }
    }, [targetType, targetId])

    useEffect(() => {
        fetchComments()
    }, [fetchComments])

    const addComment = async (body: string, authConfig: object, parentId?: string) => {
        const api = API({}, {})
        const res = await api.post(
            API_ENDPOINTS.COMMENTS,
            { targetType, targetId, body, parentId: parentId ?? null },
            authConfig
        )
        setComments(prev => [...prev, res.data])
    }

    const deleteComment = async (commentId: string, authConfig: object) => {
        const api = API({}, {})
        await api.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`, authConfig)
        setComments(prev => prev.filter(c => c.id !== commentId))
    }

    return { comments, isLoading, error, addComment, deleteComment }
}
