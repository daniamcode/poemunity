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

  getPoemsByUser (user) {
    return _poems.filter((poems) => poems.author === user.name)
  }

  getFavouritePoemsByUser (user) {
    return _poems.filter((poems) => poems.likes.some((element) => element === user.sub))
  }

  sortPoems (sort, poems) {
    if (sort === ORDER_BY_TITLE) {
      poems.sort(function (a, b) {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1
        if (a.title.toLowerCase() > b.title.toLowerCase()) return 1
        return 0
      })
    }
    if (sort === ORDER_BY_LIKES) {
      poems.sort(function (a, b) {
        return b.likes.length - a.likes.length
      })
    }
    if (sort === ORDER_BY_RANDOM) {
      poems.sort(() => Math.random() - 0.5)
    }
    if (sort === ORDER_BY_DATE) {
      poems.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date)
      })
    }
    return poems
  }

  SortObjectOfObjects (data, attribute) {
    const array = []
    for (const prop in data) {
      if (data.hasOwnProperty(prop)) {
        const object = {}
        object[prop] = data[prop]
        object.tempSortName = data[prop][attribute]
        array.push(object)
      }
    }

    array.sort(function (a, b) {
      const at = a.tempSortName
      const bt = b.tempSortName
      return at > bt ? -1 : (at < bt ? 1 : 0)
    })

    const result = []
    for (let i = 0, l = array.length; i < l; i++) {
      const object = array[i]
      delete object.tempSortName
      for (const prop in object) {
        if (object.hasOwnProperty(prop)) {
          var id = prop
        }
      }
      const item = object[id]
      result.push(item)
    }
    return result
  }

  getRanking (poems, poemPoints, likePoints) {
    let rank = poems.reduce(function (accumulator, item) {
      const points = (accumulator[item.userId]?.points || 0) + poemPoints + (likePoints * item.likes.length)

      accumulator[item.userId] = {
        author: item.author,
        picture: item.picture,
        points
      }

      return accumulator
    }, {})

    rank = this.SortObjectOfObjects(rank, 'points')

    return rank
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
