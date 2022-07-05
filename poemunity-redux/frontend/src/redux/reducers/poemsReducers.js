import { commonReducer, INITIAL } from './commonReducers';

export const ACTIONS = {
    ALL_POEMS: 'all-poems',
    POEMS_LIST: 'poems-list',
    RANKING: 'ranking'            
};

// used for MyFavouritePoems and for MyPoems
export function allPoemsQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS?.ALL_POEMS);
}

export function poemsListQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS?.POEMS_LIST);
}

export function rankingQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS?.RANKING);
}
