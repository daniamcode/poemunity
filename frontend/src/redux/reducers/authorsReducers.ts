import { Author } from '../../typescript/interfaces'
import { commonReducer, INITIAL } from './commonReducers'
import { StateItem } from '../../typescript/interfaces'

export const ACTIONS = {
    TOP_AUTHORS: 'top-authors',
    AUTHORS_BY_LETTER: 'authors-by-letter',
    AUTHORS_LETTERS: 'authors-letters'
}

interface Action {
    type: string
    payload?: any
}

export function topAuthorsQuery(state: StateItem<Author[]> = INITIAL, action: Action): StateItem<Author[]> {
    return commonReducer({ state, action, actionType: ACTIONS.TOP_AUTHORS })
}

export function authorsByLetterQuery(state: StateItem<Author[]> = INITIAL, action: Action): StateItem<Author[]> {
    return commonReducer({ state, action, actionType: ACTIONS.AUTHORS_BY_LETTER })
}

export function authorsLettersQuery(state: StateItem<string[]> = INITIAL, action: Action): StateItem<string[]> {
    return commonReducer({ state, action, actionType: ACTIONS.AUTHORS_LETTERS })
}
