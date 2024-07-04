import { commonReducer, INITIAL } from './commonReducers'
import { StateItem, User } from '../../typescript/interfaces'

export const ACTIONS = {
    LOGIN: 'login',
    REGISTER: 'register'
}

interface Action {
  type: string
  payload?: object[]
}

export function loginQuery(
    state: StateItem<string> = INITIAL,
    action: Action
): StateItem<string> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.LOGIN
    })
}

export function registerQuery(
    state: StateItem<User> = INITIAL,
    action: Action
): StateItem<User> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.REGISTER
    })
}
