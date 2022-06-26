import { commonReducer, INITIAL } from './commonReducers';
import { ACTIONS }                    from '../actions/poemActions';

export function poemQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS?.POEM);
}
