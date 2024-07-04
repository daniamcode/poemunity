import { Poem, StateItem } from '../../typescript/interfaces'
import { commonReducer, INITIAL } from './commonReducers'

export const ACTIONS = {
    POEM: 'poem',
    LIKE_POEM: 'like-poem',
    SAVE_POEM: 'save-poem',
    DELETE_POEM: 'delete-poem'
}

interface Action {
  type: string
  payload?: Poem
}

export function poemQuery(
    state: StateItem<Poem> = INITIAL,
    action: Action
): StateItem<Poem> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.POEM
    })
}
