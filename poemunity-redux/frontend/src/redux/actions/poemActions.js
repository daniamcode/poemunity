import { getAction } from './commonActions';
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS';

export const ACTIONS = {
    POEMS: 'poems',    
};

export function getPoemsAction({ options, callbacks = {} } = {}) {
    return function dispatcher(dispatch) {
        return getAction({
            type: ACTIONS.POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            // actionCallbacks,
        });
    };
}
