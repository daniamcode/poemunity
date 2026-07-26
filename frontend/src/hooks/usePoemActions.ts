import React from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch } from '../redux/store'
import { deletePoemAction, likePoemAction, updatePoemCacheAfterLikePoemAction } from '../redux/actions/poemActions'
import { dropPoemFromCaches, dropPoemFromFavouritesCache } from '../redux/actions/poemsActions'
import { poemUpdated, poemRemoved } from '../redux/reducers/poemEntitiesReducers'
import { Context, Poem } from '../typescript/interfaces'
import { manageError, manageSuccess } from '../utils/notifications'

export interface UsePoemActionsParams {
    poem: Poem
    context: Context
    /**
     * Optional callback to execute after successful poem deletion.
     * Use this for custom navigation or other post-delete actions.
     * If not provided, will update caches and show success notification.
     */
    onDeleteSuccess?: () => void
}

export function usePoemActions({ poem, context, onDeleteSuccess }: UsePoemActionsParams) {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const onLike = (event: React.SyntheticEvent) => {
        event.preventDefault()
        dispatch(
            likePoemAction({
                params: {
                    poemId: poem.id
                },
                context,
                callbacks: {
                    success: () => {
                        // Single source of truth: toggle the like on the ONE poem
                        // entity; every list view re-reads it, no per-cache patching.
                        const isLiked = poem.likes?.includes(context.userId)
                        const newLikes = isLiked
                            ? poem.likes.filter((id: string) => id !== context.userId)
                            : [...(poem.likes || []), context.userId]

                        dispatch(poemUpdated({ id: poem.id, changes: { likes: newLikes } }))

                        // The "my favourites" list is a filtered view (poems the
                        // user liked): unliking must remove the poem from it.
                        if (isLiked) {
                            dispatch(dropPoemFromFavouritesCache({ poemId: poem.id }))
                        }

                        // The Detail page keeps its own single-poem cache in sync.
                        dispatch(
                            updatePoemCacheAfterLikePoemAction({
                                context
                            })
                        )
                    }
                }
            })
        )
    }

    const onDelete = (event: React.SyntheticEvent) => {
        event.preventDefault()
        dispatch(
            deletePoemAction({
                params: {
                    poemId: poem.id
                },
                context,
                callbacks: {
                    success: () => {
                        // Remove the ONE entity, then drop its id from every list
                        // cache — replaces the old per-cache delete thunk family.
                        dispatch(poemRemoved(poem.id))
                        dispatch(dropPoemFromCaches({ poemId: poem.id }))

                        // Show success notification
                        manageSuccess('Poem deleted')

                        // Execute custom callback if provided (e.g., navigation)
                        if (onDeleteSuccess) {
                            onDeleteSuccess()
                        }
                    },
                    error: () => {
                        manageError('Sorry. There was an error deleting the poem')
                    }
                }
            })
        )
    }

    const onEdit = () => {
        router.push({
            pathname: '/profile',
            query: { edit: poem.id }
        })
    }

    return {
        onLike,
        onDelete,
        onEdit
    }
}
