import React from 'react'
import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../redux/store'
import { deletePoemAction, likePoemAction, updatePoemCacheAfterLikePoemAction } from '../redux/actions/poemActions'
import {
    updateAllPoemsCacheAfterLikePoemAction,
    updateMyFavouritePoemsCacheAfterLikePoemAction,
    updateMyPoemsCacheAfterDeletePoemAction,
    updatePoemsListCacheAfterDeletePoemAction,
    updatePoemsListCacheAfterLikePoemAction,
    updateRankingCacheAfterDeletePoemAction,
    updateRankingCacheAfterLikePoemAction
} from '../redux/actions/poemsActions'
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
    const history = useHistory()

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
                        dispatch(
                            updatePoemsListCacheAfterLikePoemAction({
                                poemId: poem.id,
                                context
                            })
                        )
                        dispatch(
                            updateRankingCacheAfterLikePoemAction({
                                poemId: poem.id,
                                context
                            })
                        )
                        dispatch(
                            updateAllPoemsCacheAfterLikePoemAction({
                                poemId: poem.id,
                                context
                            })
                        )
                        dispatch(
                            updateMyFavouritePoemsCacheAfterLikePoemAction({
                                poemId: poem.id,
                                context
                            })
                        )
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
                        // Update caches
                        dispatch(
                            updatePoemsListCacheAfterDeletePoemAction({
                                poemId: poem.id
                            })
                        )
                        dispatch(
                            updateRankingCacheAfterDeletePoemAction({
                                poemId: poem.id
                            })
                        )
                        dispatch(
                            updateMyPoemsCacheAfterDeletePoemAction({
                                poemId: poem.id
                            })
                        )

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
        context.setState({
            ...context,
            elementToEdit: poem.id
        })
        history.push({
            pathname: '/profile',
            state: {
                elementToEdit: poem.id,
                poemData: poem
            }
        })
    }

    return {
        onLike,
        onDelete,
        onEdit
    }
}
