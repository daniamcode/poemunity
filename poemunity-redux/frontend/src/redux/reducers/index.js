import { combineReducers } from 'redux';

import * as poemReducers from './poemReducers';
import * as poemsReducers from './poemsReducers';


const poemunityState = combineReducers({
    ...poemReducers,
    ...poemsReducers,
});

export default poemunityState;
