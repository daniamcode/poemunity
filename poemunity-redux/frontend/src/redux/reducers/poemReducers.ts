import { Poem } from '../../typescript/interfaces';
import { commonReducer, INITIAL } from './commonReducers';
import {StateItem} from '../../typescript/interfaces'


export const ACTIONS = {
    POEM: 'poem',
    LIKE_POEM: 'like-poem',
};

interface Action {
    type: string
    payload?: Poem[]
}

export function poemQuery(state: StateItem = INITIAL, action: Action) {
    return commonReducer({ state, action, actionType: ACTIONS?.POEM });
}
