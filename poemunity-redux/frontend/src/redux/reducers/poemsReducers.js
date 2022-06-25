import { ACTIONS }                    from '../actions/poemsActions';
import { commonReducer, INITIAL } from './commonReducers';

export function poemsQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS.POEMS);
}

export function rankingQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS.RANKING);
}
