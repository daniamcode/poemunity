import { Poem } from '../../typescript/interfaces';
import { commonReducer, INITIAL } from './commonReducers';

export const ACTIONS = {
    POEM: 'poem',
    LIKE_POEM: 'like-poem',
};

interface Action {
    type: string
    payload?: Poem[]
}

export function poemQuery(state = INITIAL, action: Action) {
    return commonReducer({ state, action, actionType: ACTIONS?.POEM });
}
