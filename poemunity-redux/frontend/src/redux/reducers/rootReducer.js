import { combineReducers } from 'redux';

import * as poemReducers from './poemReducers';
import * as poemsReducers from './poemsReducers';


const rootReducer = combineReducers({
    ...poemReducers,
    ...poemsReducers,
});

export {rootReducer};
