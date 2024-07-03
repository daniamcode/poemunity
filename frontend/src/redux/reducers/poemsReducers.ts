import { Poem } from '../../typescript/interfaces'
import { commonReducer, INITIAL } from './commonReducers'
import { StateItem } from '../../typescript/interfaces'

export const ACTIONS = {
  ALL_POEMS: 'all-poems',
  POEMS_LIST: 'poems-list',
  RANKING: 'ranking',
  CREATE_POEM: 'create-poem'
}

interface Action {
  type: string
  payload?: Poem[]
}

// used for MyFavouritePoems and for MyPoems
export function allPoemsQuery(
  state: StateItem<Poem[]> = INITIAL,
  action: Action
): StateItem<Poem[]> {
  return commonReducer({
    state,
    action,
    actionType: ACTIONS?.ALL_POEMS,
    ...(state?.abortRequests !== undefined && {
      abortRequests: state?.abortRequests
    })
  })
}

export function poemsListQuery(
  state: StateItem<Poem[]> = INITIAL,
  action: Action
): StateItem<Poem[]> {
  return commonReducer({
    state,
    action,
    actionType: ACTIONS?.POEMS_LIST
  })
}

export function rankingQuery(
  state: StateItem<Poem[]> = INITIAL,
  action: Action
): StateItem<Poem[]> {
  return commonReducer({
    state,
    action,
    actionType: ACTIONS?.RANKING
  })
}

export function createPoemQuery(
  state: StateItem<Poem[]> = INITIAL,
  action: Action
): StateItem<Poem[]> {
  return commonReducer({
    state,
    action,
    actionType: ACTIONS?.CREATE_POEM
  })
}
