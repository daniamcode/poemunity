import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../../../redux/store'
import {
    deletePoemAction,
    likePoemAction,
    updatePoemCacheAfterLikePoemAction
} from '../../../redux/actions/poemActions'
import {
    updateAllPoemsCacheAfterLikePoemAction,
    updatePoemsListCacheAfterLikePoemAction,
    updateRankingCacheAfterLikePoemAction
} from '../../../redux/actions/poemsActions'
import { manageError, manageSuccess } from '../../../utils/notifications'
import { Context } from '../../../typescript/interfaces'

export function usePoemActions(poemId: string, context: Context) {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const handleLike = (event: React.SyntheticEvent) => {
        event.preventDefault()
        dispatch(
            likePoemAction({
                params: {
                    poemId
                },
                context,
                callbacks: {
                    success: () => {
                        dispatch(
                            updatePoemsListCacheAfterLikePoemAction({
                                poemId,
                                context
                            })
                        )
                        dispatch(
                            updateRankingCacheAfterLikePoemAction({
                                poemId,
                                context
                            })
                        )
                        dispatch(
                            updateAllPoemsCacheAfterLikePoemAction({
                                poemId,
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

    const handleDelete = (event: React.SyntheticEvent) => {
        event.preventDefault()
        dispatch(
            deletePoemAction({
                params: {
                    poemId
                },
                context,
                callbacks: {
                    success: () => {
                        history.push('/')
                        manageSuccess('Poem deleted')
                    },
                    error: () => {
                        manageError('Sorry. There was an error deleting the poem')
                    }
                }
            })
        )
    }

    const handleEdit = () => {
        context.setState({
            ...context,
            elementToEdit: poemId
        })
        history.push('/profile')
    }

    return {
        handleLike,
        handleDelete,
        handleEdit
    }
}
