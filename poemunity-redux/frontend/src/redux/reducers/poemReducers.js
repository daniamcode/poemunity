import { commonReducer, INITIAL } from './commonReducers';

export const ACTIONS = {
    POEM: 'poem',
    LIKE_POEM: 'like-poem',
};

export function poemQuery(state = INITIAL, action) {
    return commonReducer(state, action, ACTIONS?.POEM);
}
