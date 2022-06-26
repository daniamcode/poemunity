import { ACTIONS }                    from '../actions/poemsActions';
import { commonReducer, INITIAL } from './commonReducers';

// used for MyFavouritePoems and for MyPoems
export function allPoemsQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS.ALL_POEMS);
}

export function poemsListQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS.POEMS_LIST);
}

export function rankingQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS.RANKING);
}
