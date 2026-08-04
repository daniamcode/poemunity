import React from 'react'
import { useRouter } from 'next/router'
import { useAppDispatch } from '../redux/store'
import { deletePoemAction, likePoemAction, savePoemAction } from '../redux/actions/poemActions'
import { getUserStatsAction } from '../redux/actions/statsActions'
import {
    dropPoemFromCaches,
    dropPoemFromFavouritesCache,
    addPoemToFavouritesCache,
    movePoemBetweenDraftAndPublished,
    setRanking
} from '../redux/actions/poemsActions'
import { poemUpdated, poemRemoved } from '../redux/reducers/poemEntitiesReducers'
import { Context, Poem, PoemStatus } from '../typescript/interfaces'
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
                        // ...and your own stats panel counted that poem. The rule
                        // is one line: THE MUTATIONS THAT ADOPT A FRESH RANKING
                        // ARE THE MUTATIONS THAT CHANGE YOUR STATS — create,
                        // delete, publish/withdraw. Liking is the one exception,
                        // because it changes the stats of the poem's author, who
                        // is somebody else and is not looking at this session.
                        dispatch(getUserStatsAction())

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

    // Publish a draft, or withdraw a published poem back into drafts. Both are a
    // PATCH of `{ status }` on the poem route — the same route an edit uses.
    const onSetStatus = (status: PoemStatus) => (event: React.SyntheticEvent) => {
        event.preventDefault()
        dispatch(
            savePoemAction({
                params: { poemId: poem.id },
                context,
                data: { status },
                callbacks: {
                    success: (response: any) => {
                        // One entity, updated once; the id-lists only move it
                        // between Drafts and the public lists.
                        dispatch(poemUpdated({ id: poem.id, changes: { status } }))
                        dispatch(movePoemBetweenDraftAndPublished({ poemId: poem.id, status }))
                        // Publishing/withdrawing changes the author's poem count,
                        // so the server recomputes the ranking and sends it back.
                        dispatch(setRanking(response?.ranking))
                        // And the poem moved into or out of the published count
                        // the stats panel shows. Refetched rather than adjusted
                        // by ±1 locally: withdrawing also removes that poem's
                        // likes from `likesReceived`, and the client does not
                        // know how many it had.
                        dispatch(getUserStatsAction())
                        manageSuccess(status === 'published' ? 'Poem published' : 'Poem moved to drafts')
                    },
                    error: () => {
                        manageError('Sorry. There was an error updating the poem')
                    }
                }
            })
        )
    }

    return {
        onLike,
        onDelete,
        onEdit,
        onPublish: onSetStatus('published'),
        onUnpublish: onSetStatus('draft')
    }
}
