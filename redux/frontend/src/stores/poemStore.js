import {
  EventEmitter
} from 'events'
import dispatcher from '../appDispatcher'
import actionTypes from '../actions/actionTypes'
import {
  ORDER_BY_DATE,
  ORDER_BY_LIKES,
  ORDER_BY_RANDOM,
  ORDER_BY_TITLE
} from '../data/constants'

const CHANGE_EVENT = 'change'
let _poem = null
let _poems = []
const _sort = ''

class PoemStore extends EventEmitter {
  addChangeListener (callback) {
    this.on(CHANGE_EVENT, callback)
  }

  removeChangeListener (callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }

  emitChange () {
    this.emit(CHANGE_EVENT)
  }

  getPoem (id) {
    return id ? _poems.filter(poem => poem._id === id)[0] : _poem
  }

  getPoems (criteria) {
    if (!criteria) {
      return _poems
    } else {
      return _poems.filter((poems) => poems.genre === criteria)
    }
  }
}

const poemStore = new PoemStore()
dispatcher.register((action) => {
  switch (action.type) {
    case actionTypes.LOAD_POEM:
      _poem = action.data
      poemStore.emitChange()
      break
    case actionTypes.LOAD_POEMS:
      _poems = poemStore.sortPoems('likes', action.data)
      poemStore.emitChange()
      break
    case actionTypes.CREATE_POEM:
      _poems = [..._poems, {
        ...action.data
      }]
      poemStore.emitChange()
      break
    case actionTypes.DELETE_POEM:
      _poems = _poems.filter((poem) => poem._id !== action.data._id)
      poemStore.emitChange()
      break
    case actionTypes.LIKE_POEM:
      _poems = _poems.map((poem) => {
        if (poem._id === action.data._id) {
          poem.likes = action.data.likes
        }
        return poem
      })
      _poem = action.data
      poemStore.emitChange()
      break
    case actionTypes.SORT_POEMS:
      // _sort = action.data
      _poems = poemStore.sortPoems(action.data, _poems)
      poemStore.emitChange()
      break
    default:
      break
  }
})

export default poemStore
