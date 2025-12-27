/* eslint-disable max-lines */
import store from '../store/index'
import { getAction, postAction, getTypes } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import cloneDeep from 'lodash/cloneDeep'
import { ACTIONS } from '../reducers/poemsReducers'
import { AppDispatch } from '../store'
import { ReduxOptions, ReduxCallbacks, Context, Poem } from '../../typescript/interfaces'

interface GetAllPoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getAllPoemsAction({ params, options, callbacks }: GetAllPoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.ALL_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface GetPoemsListActionProps {
    params?: object | null
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getPoemsListAction({ params, options, callbacks }: GetPoemsListActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.POEMS_LIST,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface GetRankingActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getRankingAction({ params, options, callbacks }: GetRankingActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.RANKING,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface GetMyPoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getMyPoemsAction({ params, options, callbacks }: GetMyPoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface GetMyFavouritePoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getMyFavouritePoemsAction({ params, options, callbacks }: GetMyFavouritePoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_FAVOURITE_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface UpdatePoemsListCacheAfterLikePoemActionProps {
    context: Context
    poemId: string
}

export function updatePoemsListCacheAfterLikePoemAction({
    poemId,
    context
}: UpdatePoemsListCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { poemsListQuery } = store.getState()
        const newPoemsListQuery = cloneDeep(poemsListQuery.item as Poem[])

        const poemsListQueryUpdated = newPoemsListQuery?.reduce((acc: Poem[], poem: Poem) => {
            const coincidence = poem.id === poemId
            if (coincidence) {
                const index = poem?.likes?.indexOf(context.userId)
                if (index !== -1) {
                    poem.likes.splice(index, 1)
                } else {
                    poem.likes.push(context.userId)
                }
            }
            acc.push(poem)

            return acc
        }, [])

        const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST)
        dispatch({
            type: fulfilledAction,
            payload: {
                poems: poemsListQueryUpdated,
                page: poemsListQuery.page,
                hasMore: poemsListQuery.hasMore,
                total: poemsListQuery.total,
                totalPages: poemsListQuery.totalPages
            }
        })
    }
}

interface UpdateRankingCacheAfterLikePoemActionProps {
    context: Context
    poemId: string
}

// todo: refactor (this function is very similar to updatePoemsListCacheAfterLikePoemAction)
export function updateRankingCacheAfterLikePoemAction({ poemId, context }: UpdateRankingCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const {
            rankingQuery: { item: rankingQuery }
        } = store.getState()
        const newRankingQuery = cloneDeep(rankingQuery as Poem[])

        const rankingQueryUpdated = newRankingQuery?.reduce((acc: Poem[], poem: Poem) => {
            const coincidence = poem.id === poemId
            if (coincidence) {
                const index = poem?.likes?.indexOf(context.userId)
                if (index !== -1) {
                    poem.likes.splice(index, 1)
                } else {
                    poem.likes.push(context.userId)
                }
            }
            acc.push(poem)

            return acc
        }, [])

        const { fulfilledAction } = getTypes(ACTIONS.RANKING)
        dispatch({
            type: fulfilledAction,
            payload: rankingQueryUpdated
        })
    }
}

interface UpdateAllPoemsCacheAfterLikePoemActionProps {
    context: Context
    poemId: string
}

// todo: refactor (this function is very similar to updatePoemsListCacheAfterLikePoemAction)
export function updateAllPoemsCacheAfterLikePoemAction({
    poemId,
    context
}: UpdateAllPoemsCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const {
            allPoemsQuery: { item: allPoemsQuery }
        } = store.getState()
        const newAllPoemsQuery = cloneDeep(allPoemsQuery as Poem[])

        const allPoemsQueryUpdated = newAllPoemsQuery?.reduce((acc: Poem[], poem: Poem) => {
            const coincidence = poem.id === poemId
            if (coincidence) {
                const index = poem?.likes?.indexOf(context.userId)
                if (index !== -1) {
                    poem.likes.splice(index, 1)
                } else {
                    poem.likes.push(context.userId)
                }
            }
            acc.push(poem)

            return acc
        }, [])

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS)
        dispatch({
            type: fulfilledAction,
            payload: allPoemsQueryUpdated
        })
    }
}

interface CreatePoemActionProps {
    poem: Poem
    callbacks?: ReduxCallbacks
    context: Context
    options?: ReduxOptions
}

export function createPoemAction({ poem, context, callbacks, options = {} }: CreatePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.CREATE_POEM,
            url: `${API_ENDPOINTS.POEMS}`,
            dispatch,
            data: poem,
            callbacks,
            config: context.config,
            options
        })
    }
}

interface UpdateAllPoemsCacheAfterCreatePoemActionProps {
    response: Poem
}

export function updateAllPoemsCacheAfterCreatePoemAction({ response }: UpdateAllPoemsCacheAfterCreatePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const {
            allPoemsQuery: { item: allPoemsQuery }
        } = store.getState()
        const newAllPoemsQuery = cloneDeep(allPoemsQuery as Poem[])

        newAllPoemsQuery.push(response)

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS)
        dispatch({
            type: fulfilledAction,
            payload: newAllPoemsQuery
        })
    }
}

interface updateAllPoemsCacheAfterDeletePoemActionProps {
    poemId: string
}

export function updateAllPoemsCacheAfterDeletePoemAction({ poemId }: updateAllPoemsCacheAfterDeletePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const {
            allPoemsQuery: { item: allPoemsQuery }
        } = store.getState()
        const newAllPoemsQuery = cloneDeep(allPoemsQuery as Poem[])

        const allPoemsQueryUpdated = newAllPoemsQuery?.filter((poem: Poem) => poem.id !== poemId)

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS)
        dispatch({
            type: fulfilledAction,
            payload: allPoemsQueryUpdated
        })
    }
}

interface UpdatePoemsListCacheAfterDeletePoemActionProps {
    poemId: string
}

export function updatePoemsListCacheAfterDeletePoemAction({ poemId }: UpdatePoemsListCacheAfterDeletePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { poemsListQuery } = store.getState()
        const newPoemsListQuery = cloneDeep(poemsListQuery.item as Poem[])

        const poemsListQueryUpdated = newPoemsListQuery?.filter((poem: Poem) => poem.id !== poemId)

        console.log(
            `Poem deleted: ${poemId}. Updating cache with ${poemsListQueryUpdated?.length || 0} poems remaining.`
        )

        const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST)
        dispatch({
            type: fulfilledAction,
            payload: {
                poems: poemsListQueryUpdated,
                page: poemsListQuery.page,
                hasMore: poemsListQuery.hasMore,
                total: Math.max(0, (poemsListQuery.total || 0) - 1), // Decrease total count
                totalPages: poemsListQuery.totalPages
            }
        })
    }
}

interface UpdateRankingCacheAfterDeletePoemActionProps {
    poemId: string
}

// todo: refactor (this function is very similar to updatePoemsListCacheAfterDeletePoemAction)
export function updateRankingCacheAfterDeletePoemAction({ poemId }: UpdateRankingCacheAfterDeletePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const {
            rankingQuery: { item: rankingQuery }
        } = store.getState()
        const newRankingQuery = cloneDeep(rankingQuery as Poem[])

        const rankingQueryUpdated = newRankingQuery?.filter((poem: Poem) => poem.id !== poemId)

        const { fulfilledAction } = getTypes(ACTIONS.RANKING)
        dispatch({
            type: fulfilledAction,
            payload: rankingQueryUpdated
        })
    }
}

interface updateAllPoemsCacheAfterSavePoemActionProps {
    poem: Poem
    poemId: string
}

// todo: is this kind of duplicated with updatePoemsListCacheAfterSavePoemAction?
export function updateAllPoemsCacheAfterSavePoemAction({ poem, poemId }: updateAllPoemsCacheAfterSavePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const {
            allPoemsQuery: { item: allPoemsQuery }
        } = store.getState()

        if (!allPoemsQuery) {
            console.log('All poems cache not loaded, skipping cache update for save poem')
            return
        }

        const newAllPoemsQuery = cloneDeep(allPoemsQuery as Poem[])

        // todo: refactor with a reduce
        const allPoemsQueryUpdated = newAllPoemsQuery?.filter((poem: Poem) => poem.id !== poemId)
        const poemToUpdate = newAllPoemsQuery?.find((poem: Poem) => poem.id === poemId)
        const poemUpdated = {
            ...poemToUpdate,
            ...poem
        }
        allPoemsQueryUpdated.push(poemUpdated)

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS)
        dispatch({
            type: fulfilledAction,
            payload: allPoemsQueryUpdated
        })
    }
}

interface UpdateMyPoemsCacheAfterSavePoemActionProps {
    poem: Poem
    poemId: string
}

export function updateMyPoemsCacheAfterSavePoemAction({ poem, poemId }: UpdateMyPoemsCacheAfterSavePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { myPoemsQuery } = store.getState()
        const myPoemsQueryItem = myPoemsQuery.item

        if (!myPoemsQueryItem) {
            console.log('My poems cache not loaded, skipping cache update for save poem')
            return
        }

        const newMyPoemsQuery = cloneDeep(myPoemsQueryItem as Poem[])

        const myPoemsQueryUpdated = newMyPoemsQuery?.reduce((acc: Poem[], currentPoem: Poem) => {
            if (currentPoem.id === poemId) {
                acc.push({
                    ...currentPoem,
                    ...poem
                })
            } else {
                acc.push(currentPoem)
            }
            return acc
        }, [])

        const { fulfilledAction } = getTypes(ACTIONS.MY_POEMS)
        dispatch({
            type: fulfilledAction,
            payload: {
                poems: myPoemsQueryUpdated,
                page: myPoemsQuery.page,
                hasMore: myPoemsQuery.hasMore,
                total: myPoemsQuery.total,
                totalPages: myPoemsQuery.totalPages
            }
        })
    }
}

interface UpdatePoemsListCacheAfterSavePoemActionProps {
    poem: Poem
    poemId: string
}

export function updatePoemsListCacheAfterSavePoemAction({
    poem,
    poemId
}: UpdatePoemsListCacheAfterSavePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { poemsListQuery } = store.getState()
        const poemsListQueryItem = poemsListQuery.item

        if (!poemsListQueryItem) {
            console.log('Poems list cache not loaded, skipping cache update for save poem')
            return
        }

        const newPoemsListQuery = cloneDeep(poemsListQueryItem as Poem[])

        const poemsListQueryUpdated = newPoemsListQuery?.reduce((acc: Poem[], currentPoem: Poem) => {
            if (currentPoem.id === poemId) {
                acc.push({
                    ...currentPoem,
                    ...poem
                })
            } else {
                acc.push(currentPoem)
            }
            return acc
        }, [])

        const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST)
        dispatch({
            type: fulfilledAction,
            payload: {
                poems: poemsListQueryUpdated,
                page: poemsListQuery.page,
                hasMore: poemsListQuery.hasMore,
                total: poemsListQuery.total,
                totalPages: poemsListQuery.totalPages
            }
        })
    }
}
