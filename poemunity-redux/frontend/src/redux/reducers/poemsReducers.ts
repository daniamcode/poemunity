import { Poem } from '../../typescript/interfaces';
import { commonReducer, INITIAL } from './commonReducers';

export const ACTIONS = {
    ALL_POEMS: 'all-poems',
    POEMS_LIST: 'poems-list',
    RANKING: 'ranking'            
};

interface Action {
    type: string
    payload?: Poem[]
}

// used for MyFavouritePoems and for MyPoems
export function allPoemsQuery(state = INITIAL, action: Action) {
    return commonReducer({ state, action, actionType: ACTIONS?.ALL_POEMS });
}

export function poemsListQuery(state = INITIAL, action: Action) {
    return commonReducer({ state, action, actionType: ACTIONS?.POEMS_LIST });
}

export function rankingQuery(state = INITIAL, action: Action) {
    return commonReducer({ state, action, actionType: ACTIONS?.RANKING });
}
