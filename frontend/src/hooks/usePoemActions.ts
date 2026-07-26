import React from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch } from '../redux/store'
import { deletePoemAction, likePoemAction } from '../redux/actions/poemActions'
import {
    dropPoemFromCaches,
    dropPoemFromFavouritesCache,
    addPoemToFavouritesCache,
    setRanking
} from '../redux/actions/poemsActions'
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
                    success: (response: any) => {
                        // Single source of truth: toggle the like on the ONE poem
                        // entity; every list view re-reads it, no per-cache patching.
                        const isLiked = poem.likes?.includes(context.userId)
                        const newLikes = isLiked
                            ? poem.likes.filter((id: string) => id !== context.userId)
                            : [...(poem.likes || []), context.userId]

                        dispatch(poemUpdated({ id: poem.id, changes: { likes: newLikes } }))

                        // Ranking is server-computed: the like response carries the
                        // freshly recomputed top-N, so we adopt it verbatim (exact
                        // points/order/boundaries, no client-side scoring).
                        dispatch(setRanking(response?.ranking))

                        // The "my favourites" list is a filtered view (poems the
                        // user liked): keep its membership in sync both ways.
                        if (isLiked) {
                            dispatch(dropPoemFromFavouritesCache({ poemId: poem.id }))
                        }
                        else {
                            dispatch(addPoemToFavouritesCache({ poemId: poem.id }))
                        }
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
                    success: (response: any) => {
                        // Remove the ONE entity, then drop its id from every list
                        // cache — replaces the old per-cache delete thunk family.
                        dispatch(poemRemoved(poem.id))
                        dispatch(dropPoemFromCaches({ poemId: poem.id }))

                        // The delete response carries the recomputed ranking (the
                        // author lost this poem's points) — adopt it verbatim.
                        dispatch(setRanking(response?.ranking))

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
