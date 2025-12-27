import { combineReducers } from 'redux'

import * as poemReducers from './poemReducers'
import * as poemsReducers from './poemsReducers'
import * as loginReducers from './loginReducers'

// todo: understand why this is needed, and also in other places
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _poemReducersActions, ...restOfPoemReducers } = poemReducers
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _poemsReducersActions, ...restOfPoemsReducers } = poemsReducers
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _loginReducersActions, ...restOfLoginReducers } = loginReducers

const rootReducer = combineReducers({
    ...restOfPoemReducers,
    ...restOfPoemsReducers,
    ...restOfLoginReducers
})

export { rootReducer }
