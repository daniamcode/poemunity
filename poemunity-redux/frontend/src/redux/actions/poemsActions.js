import store from '../store/index';
import { getAction, postAction, getTypes } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import cloneDeep from 'lodash/cloneDeep';
import {ACTIONS} from '../reducers/poemsReducers';


export function getAllPoemsAction({ params, options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
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

export function getPoemsListAction({ params, options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return getAction({
            type: ACTIONS.POEMS_LIST,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options
            // actionCallbacks,
        });
    };
}

export function getRankingAction({ params, options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return getAction({
            type: ACTIONS.RANKING,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options
            // actionCallbacks,
        });
    };
}

export function updatePoemsListCacheAfterLikePoemAction({ poemId, context } = {}) {
    return function dispatcher(dispatch) {
        const { poemsListQuery: { item: poemsListQuery }  } = store.getState();
        const newPoemsListQuery = cloneDeep(poemsListQuery);

        const poemsListQueryUpdated = newPoemsListQuery?.reduce((acc, poem) => {
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

// todo: refactor (this function is very similar to updatePoemsListCacheAfterLikePoemAction)
export function updateRankingCacheAfterLikePoemAction({ poemId, context } = {}) {
    return function dispatcher(dispatch) {
        const { rankingQuery: { item: rankingQuery }  } = store.getState();
        const newRankingQuery = cloneDeep(rankingQuery);

        const rankingQueryUpdated = newRankingQuery?.reduce((acc, poem) => {
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

// todo: refactor (this function is very similar to updatePoemsListCacheAfterLikePoemAction)
export function updateAllPoemsCacheAfterLikePoemAction({ poemId, context } = {}) {
    return function dispatcher(dispatch) {
        const { allPoemsQuery: { item: allPoemsQuery }  } = store.getState();
        const newAllPoemsQuery = cloneDeep(allPoemsQuery);

        const allPoemsQueryUpdated = newAllPoemsQuery?.reduce((acc, poem) => {
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

export function createPoemAction({ poem, context, callbacks = {} }) {
    return function dispatcher(dispatch) {
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

export function updateAllPoemsCacheAfterCreatePoemAction({ response }) {
    return function dispatcher(dispatch) {
        const { allPoemsQuery: { item: allPoemsQuery }  } = store.getState();
        const newAllPoemsQuery = cloneDeep(allPoemsQuery);

        newAllPoemsQuery.push(response);

        const { fulfilledAction } = getTypes(ACTIONS.ALL_POEMS);
        console.log(newAllPoemsQuery)
        dispatch({
            type: fulfilledAction,
            payload: newAllPoemsQuery,
        });
    };
}
