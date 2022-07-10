import store from '../store/index';
import { getAction, postAction, getTypes } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import cloneDeep from 'lodash/cloneDeep';
import {ACTIONS} from '../reducers/poemsReducers';
import { AppDispatch} from '../store'
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
            callbacks,
        });
    };
}

interface GetPoemsListActionProps {
    params?: object
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
            callbacks,
        });
    };
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
            callbacks,
        });
    };
}

interface UpdatePoemsListCacheAfterLikePoemActionProps {
    context: Context
    poemId: string
}

export function updatePoemsListCacheAfterLikePoemAction({ poemId, context }: UpdatePoemsListCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { poemsListQuery: { item: poemsListQuery }  } = store.getState();
        const newPoemsListQuery = cloneDeep(poemsListQuery);

        const poemsListQueryUpdated = newPoemsListQuery?.reduce((acc: Poem[], poem: Poem) => {
            let coincidence = poem.id === poemId;
            if (coincidence) {
                const index = poem?.likes?.indexOf(context.userId);
                if(index !== -1) {
                    poem.likes.splice(index, 1);
                } else {
                    poem.likes.push(context.userId);
                }
            }
            acc.push(poem);

            return acc;
        }, []);

        const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST);
        dispatch({
            type: fulfilledAction,
            payload: poemsListQueryUpdated,
        });
    };
}

interface UpdateRankingCacheAfterLikePoemActionProps {
    context: Context
    poemId: string
}

// todo: refactor (this function is very similar to updatePoemsListCacheAfterLikePoemAction)
export function updateRankingCacheAfterLikePoemAction({ poemId, context }: UpdateRankingCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { rankingQuery: { item: rankingQuery }  } = store.getState();
        const newRankingQuery = cloneDeep(rankingQuery);

        const rankingQueryUpdated = newRankingQuery?.reduce((acc: Poem[], poem: Poem) => {
            let coincidence = poem.id === poemId;
            if (coincidence) {
                const index = poem?.likes?.indexOf(context.userId);
                if(index !== -1) {
                    poem.likes.splice(index, 1);
                } else {
                    poem.likes.push(context.userId);
                }
            }
            acc.push(poem);

            return acc;
        }, []);

        const { fulfilledAction } = getTypes(ACTIONS.RANKING);
        dispatch({
            type: fulfilledAction,
            payload: rankingQueryUpdated,
        });
    };
}

interface UpdateAllPoemsCacheAfterLikePoemActionProps {
    context: Context
    poemId: string
}

// todo: refactor (this function is very similar to updatePoemsListCacheAfterLikePoemAction)
export function updateAllPoemsCacheAfterLikePoemAction({ poemId, context }: UpdateAllPoemsCacheAfterLikePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { allPoemsQuery: { item: allPoemsQuery }  } = store.getState();
        const newAllPoemsQuery = cloneDeep(allPoemsQuery);

        const allPoemsQueryUpdated = newAllPoemsQuery?.reduce((acc: Poem[], poem: Poem) => {
            let coincidence = poem.id === poemId;
            if (coincidence) {
                const index = poem?.likes?.indexOf(context.userId);
                if(index !== -1) {
                    poem.likes.splice(index, 1);
                } else {
                    poem.likes.push(context.userId);
                }
            }
            acc.push(poem);

            return acc;
        }, []);

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS);
        dispatch({
            type: fulfilledAction,
            payload: allPoemsQueryUpdated,
        });
    };
}

interface CreatePoemActionProps {
    poem: Poem
    callbacks?: ReduxCallbacks
    context: Context
}

export function createPoemAction({ poem, context, callbacks }: CreatePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.CREATE_POEM,
            url: `${API_ENDPOINTS.POEMS}`,
            dispatch,
            data: poem,
            callbacks,
            config: context.config,
        })
    };
}

interface UpdateAllPoemsCacheAfterCreatePoemActionProps {
    response: Poem
}

export function updateAllPoemsCacheAfterCreatePoemAction({ response }: UpdateAllPoemsCacheAfterCreatePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { allPoemsQuery: { item: allPoemsQuery }  } = store.getState();
        const newAllPoemsQuery = cloneDeep(allPoemsQuery);

        newAllPoemsQuery.push(response);

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS);
        dispatch({
            type: fulfilledAction,
            payload: newAllPoemsQuery,
        });
    };
}
