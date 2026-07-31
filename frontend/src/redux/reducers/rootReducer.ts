import { combineReducers } from 'redux'

import * as poemReducers from './poemReducers'
import * as poemsReducers from './poemsReducers'
import * as loginReducers from './loginReducers'
import * as authorsReducers from './authorsReducers'
import * as followsReducers from './followsReducers'
import * as notificationsReducers from './notificationsReducers'
import { authorEntitiesReducer } from './authorEntitiesReducers'
import { poemEntitiesReducer } from './poemEntitiesReducers'

// todo: understand why this is needed, and also in other places
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _poemReducersActions, ...restOfPoemReducers } = poemReducers
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _poemsReducersActions, ...restOfPoemsReducers } = poemsReducers
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _loginReducersActions, ...restOfLoginReducers } = loginReducers
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _authorsReducersActions, ...restOfAuthorsReducers } = authorsReducers
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const { ACTIONS: _followsReducersActions, ...restOfFollowsReducers } = followsReducers
// Three non-reducer exports to strip here rather than one, because this module
// also exports the action-type constant and its creator. combineReducers throws
// on any value that is not a function, and would silently accept the creator —
// which IS a function — as a reducer named `unreadCountSet`.
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
const {
    ACTIONS: _notificationsActions,
    UNREAD_COUNT_SET: _unreadCountSet,
    unreadCountSet: _unreadCountSetFn,
    ...restOfNotificationsReducers
} = notificationsReducers
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

const rootReducer = combineReducers({
    ...restOfPoemReducers,
    ...restOfPoemsReducers,
    ...restOfLoginReducers,
    ...restOfAuthorsReducers,
    ...restOfFollowsReducers,
    ...restOfNotificationsReducers,
    authorEntities: authorEntitiesReducer,
    poemEntities: poemEntitiesReducer
})

export { rootReducer }
