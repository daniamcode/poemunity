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

export function loginQuery(state: StateItem<any> = INITIAL, action: Action): StateItem<any> {
    return commonReducer({ state, action, actionType: ACTIONS?.LOGIN} );
}

export function registerQuery(state: StateItem<any> = INITIAL, action: Action): StateItem<any> {
    return commonReducer({ state, action, actionType: ACTIONS?.REGISTER} );
}
