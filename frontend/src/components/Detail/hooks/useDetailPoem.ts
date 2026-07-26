import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemAction } from '../../../redux/actions/poemActions'
import { selectPoemEntityById } from '../../../redux/reducers/poemEntitiesReducers'
import { Poem } from '../../../typescript/interfaces'

const initialPoemState: Poem = {
    id: '',
    author: '',
    date: '',
    genre: '',
    likes: [],
    picture: '',
    poem: '',
    title: '',
    userId: ''
}

export function useDetailPoem(poemId: string, initialPoem?: Poem) {
    const dispatch = useAppDispatch()
    const poemQuery = useSelector((state: RootState) => state.poemQuery)
    // Single source of truth: read the poem from the normalized entity store.
    // getPoemAction seeds it on fetch, and a like dispatches poemUpdated against
    // it, so the Detail view stays in sync without a bespoke cache-patch thunk.
    const poemEntity = useSelector((state: RootState) => selectPoemEntityById(state, poemId))

    useEffect(() => {
        dispatch(getPoemAction({ options: { reset: true, fetch: false } }))
    }, [dispatch])

    useEffect(() => {
        if (poemId) {
            dispatch(getPoemAction({
                params: { poemId },
                options: { reset: true, fetch: true }
            }))
        }
    }, [dispatch, poemId])

    // Prefer the normalized entity; fall back to the fetch cache, SSR data, then empty
    const poem: Poem = poemEntity || poemQuery?.item || initialPoem || initialPoemState

    const isLoading = poemQuery.isFetching && !poem.id
    const isError = poemQuery.isError || false

    const retry = () => {
        if (poemId) {
            dispatch(getPoemAction({
                params: { poemId },
                options: { reset: true, fetch: true }
            }))
        }
    }

    return { poem, isLoading, isError, retry }
}
