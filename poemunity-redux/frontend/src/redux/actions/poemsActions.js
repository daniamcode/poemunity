import { getAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';

export const ACTIONS = {
    ALL_POEMS: 'all-poems',
    POEMS_LIST: 'poems-list',
    RANKING: 'ranking'            
};

export function getAllPoemsAction({ params, options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return getAction({
            type: ACTIONS.ALL_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options
            // actionCallbacks,
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

