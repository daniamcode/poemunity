import { combineReducers } from 'redux';

import * as poemReducers from './poemReducers';
import * as poemsReducers from './poemsReducers';

const {ACTIONS: poemReducersActions, ...restOfPoemReducers} = poemReducers;
const {ACTIONS: poemsReducersActions, ...restOfPoemsReducers} = poemsReducers;

const rootReducer = combineReducers({
    ...restOfPoemReducers,
    ...restOfPoemsReducers,
});

export {rootReducer};
