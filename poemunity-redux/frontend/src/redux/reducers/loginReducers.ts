import { commonReducer, INITIAL } from './commonReducers';
import {StateItem} from '../../typescript/interfaces'


export const ACTIONS = {
    LOGIN: 'login',
    REGISTER: 'register'
};

interface Action {
    type: string
    payload?: object[]
}

export function loginQuery(state: StateItem = INITIAL, action: Action): StateItem {
    return commonReducer({ state, action, actionType: ACTIONS?.LOGIN} );
}

export function registerQuery(state: StateItem = INITIAL, action: Action): StateItem {
    return commonReducer({ state, action, actionType: ACTIONS?.REGISTER} );
}
