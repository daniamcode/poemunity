import { combineReducers } from 'redux'

import * as poemReducers from './poemReducers'
import * as poemsReducers from './poemsReducers'
import * as loginReducers from './loginReducers'

const { ACTIONS: poemReducersActions, ...restOfPoemReducers } = poemReducers
const { ACTIONS: poemsReducersActions, ...restOfPoemsReducers } = poemsReducers
const { ACTIONS: loginReducersActions, ...restOfLoginReducers } = loginReducers

const rootReducer = combineReducers({
    ...restOfPoemReducers,
    ...restOfPoemsReducers,
    ...restOfLoginReducers
})

export { rootReducer }
