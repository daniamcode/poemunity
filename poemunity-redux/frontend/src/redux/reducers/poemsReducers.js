import { ACTIONS }                    from '../actions/poemActions';
import { commonReducer, INITIAL } from './commonReducers';

export function poemsQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS.POEMS);
}
