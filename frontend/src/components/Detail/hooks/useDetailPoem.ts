import { useEffect, useState } from 'react'
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

export function useDetailPoem(poemId: string) {
    const [poem, setPoem] = useState<Poem>(initialPoemState)
    const dispatch = useAppDispatch()
    const poemQuery = useSelector((state: RootState) => state.poemQuery)

    // Initialize poem query on mount
    useEffect(() => {
        const queryOptions = {
            reset: true,
            fetch: false
        }
        dispatch(
            getPoemAction({
                options: queryOptions
            })
        )
    }, [dispatch])

    // Load poem when poemId changes
    useEffect(() => {
        if (poemId) {
            const queryOptions = {
                reset: true,
                fetch: true
            }
            dispatch(
                getPoemAction({
                    params: { poemId },
                    options: queryOptions
                })
            )
        }
    }, [dispatch, poemId])

    // Update local poem state when query data changes
    useEffect(() => {
        if (poemQuery?.item) {
            setPoem(poemQuery.item)
        }
    }, [poemQuery?.item])

    return {
        poem,
        isLoading: poemQuery.isFetching
    }
}
