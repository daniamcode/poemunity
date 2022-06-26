import {store} from '../../index';
import { getAction, getTypes, putAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';
import cloneDeep from 'lodash/cloneDeep';

export const ACTIONS = {
    POEM: 'poem',
    LIKE_POEM: 'like-poem',
};

export function getPoemAction({ params = {}, options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return getAction({
            type: ACTIONS.POEM,
            url: `${API_ENDPOINTS.POEMS}/${params.poemId}`,
            dispatch,
            options
            // actionCallbacks,
        });
    };
}

export function likePoemAction({ params, context, options = {}, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return putAction({
            type: ACTIONS.LIKE_POEM,
            url: `${API_ENDPOINTS.POEMS}/${params.poemId}`,
            // context.config is basically the jwt token
            config: context.config,
            dispatch,
            options,
            callbacks,
        });
    };
}

export function updatePoemCacheAfterLikePoemAction({ context } = {}) {
    return function dispatcher(dispatch) {
        const { poemQuery: { item: poemQuery }  } = store.getState();
        const newPoemQuery = cloneDeep(poemQuery);

        const index = newPoemQuery?.likes?.indexOf(context.userId);
        if(index !== -1) {
            newPoemQuery.likes.splice(index, 1);
        } else {
            newPoemQuery.likes.push(context.userId);
        }            

        const { updateAction } = getTypes(ACTIONS.POEM);
        dispatch({
            type: updateAction,
            payload: newPoemQuery,
        });
    };
}