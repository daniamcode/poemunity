import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../../../redux/store'
import {
    deletePoemAction,
    likePoemAction,
    updatePoemCacheAfterLikePoemAction
} from '../../../redux/actions/poemActions'
import {
    updateAllPoemsCacheAfterLikePoemAction,
    updatePoemsListCacheAfterDeletePoemAction,
    updatePoemsListCacheAfterLikePoemAction,
    updateRankingCacheAfterDeletePoemAction,
    updateRankingCacheAfterLikePoemAction
} from '../../../redux/actions/poemsActions'
import { Context, Poem } from '../../../typescript/interfaces'
import { manageError, manageSuccess } from '../../../utils/notifications'

export interface UsePoemActionsParams {
    poem: Poem
    context: Context
}

export function usePoemActions({ poem, context }: UsePoemActionsParams) {
    const dispatch = useAppDispatch()
    const history = useHistory()

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
                        manageSuccess('Poem deleted')
                    },
                    error: () => {
                        manageError('Sorry. There was an error deleting the poem')
                    }
                }
            })
        )
    }

    const onLike = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
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
                            updatePoemCacheAfterLikePoemAction({
                                context
                            })
                        )
                    }
                }
            })
        )
    }

    const onEdit = () => {
        context.setState({
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
        onDelete,
        onLike,
        onEdit
    }
}
