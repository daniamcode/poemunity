import dispatcher from '../appDispatcher'
import actionTypes from './actionTypes'

export function sortByCriteria (criteria) {
  dispatcher.dispatch({
    type: actionTypes.SORT_POEMS,
    data: criteria
  })
}
