import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemAction } from '../../../redux/actions/poemActions'
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

    // Use Redux data when available, fall back to SSR data, then empty state
    const poem: Poem = poemQuery?.item || initialPoem || initialPoemState

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
