import { commonReducer, INITIAL } from './commonReducers';

export const ACTIONS = {
    LOGIN: 'login',
};

interface Action {
    type: string
}

export function loginQuery(state = INITIAL, action: Action) {
    return commonReducer({ state, action, actionType: ACTIONS?.LOGIN} );
}
