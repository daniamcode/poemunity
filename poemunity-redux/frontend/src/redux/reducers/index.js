import { combineReducers } from 'redux';

import * as poemsReducers from './poemsReducers';


const poemunityState = combineReducers({
    ...poemsReducers,
});

export default poemunityState;
