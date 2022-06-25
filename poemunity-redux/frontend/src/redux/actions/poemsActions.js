import { getAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';

export const ACTIONS = {
    POEMS: 'poems',
    RANKING: 'ranking'            
};

export function getPoemsAction({ params, options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return getAction({
            type: ACTIONS.POEMS,
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
