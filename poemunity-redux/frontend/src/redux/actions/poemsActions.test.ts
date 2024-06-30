import axios from 'axios'
import {
  createPoemAction,
  getAllPoemsAction,
  updateAllPoemsCacheAfterLikePoemAction,
  updatePoemsListCacheAfterLikePoemAction,
  updateRankingCacheAfterLikePoemAction
} from './poemsActions'
import * as commonActions from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/poemsReducers'
import { waitFor } from '@testing-library/react'
import { AppDispatch } from '../store'
import store from '../store/index'

jest.mock('axios', () => ({
  create: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}))
jest.mock('../store/index')

describe('getAllPoemsAction', () => {
  let dispatch: AppDispatch

  const callbacks = {
    error: () => {
      console.log('error')
    },
    reset: () => {
      console.log('error')
    },
    success: () => {
      console.log('success')
    }
  }

  beforeEach(() => {
    dispatch = jest.fn()
  })
  afterEach(() => {
    // doing this in an afterAll could lead to not reset dispatch calls number so the latter
    // tests could fail
    ;(dispatch as jest.Mock).mockClear()
  })

  test('should call getAction - no fetch', () => {
    const spy = jest.spyOn(commonActions, 'getAction')
    const options = { fetch: false }

    getAllPoemsAction({ params: {}, options, callbacks })(dispatch)

    expect(spy).toHaveBeenCalled()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      type: ACTIONS.ALL_POEMS,
      url: API_ENDPOINTS.POEMS,
      dispatch,
      options,
      params: {},
      callbacks
    })
    spy.mockRestore()
  })

  test('dispatches - reset', () => {
    const options = { fetch: false, reset: true }

    getAllPoemsAction({ params: {}, options, callbacks })(dispatch)

    expect(dispatch).toHaveBeenCalled()
  })

  test('Should dispatch right type - reset', () => {
    const options = { fetch: false, reset: true }

    getAllPoemsAction({ params: {}, options })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toBe(
      `${ACTIONS.ALL_POEMS}_reset`
    )
  })

  test('Should dispatch error when axios throws a generic error', async () => {
    ;(axios.create as jest.Mock).mockReturnThis()
    ;(axios.get as jest.Mock).mockReturnValueOnce(
      Promise.reject({ response: 'some error' })
    )

    const options = { fetch: true }

    // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
    await waitFor(() => getAllPoemsAction({ params: {}, options })(dispatch))
    // another alternative:
    // await new Promise(resolve=> {
    //     setTimeout(() => {
    //         resolve();
    //     }, 300);
    // })

    expect(axios.get).toHaveBeenCalledTimes(1) // probably is better to use "const spy = jest.spyOn(commonActions, 'getAction')" and then "expect(spy).toHaveBeenCalledTimes(1)"
    expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
    expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(
      `${ACTIONS.ALL_POEMS}_rejected`
    )
    expect((dispatch as jest.Mock).mock.calls[1][0].payload.response).toBe(
      'some error'
    )
  })

  // a network error is diferent beacause we don't get an error as an object with a reponse property
  test('Should dispatch error when axios throws a network error', async () => {
    ;(axios.create as jest.Mock).mockReturnThis()
    ;(axios.get as jest.Mock).mockReturnValueOnce(
      Promise.reject('Network error')
    )

    const options = { fetch: true }

    // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
    await waitFor(() => getAllPoemsAction({ params: {}, options })(dispatch))
    // another alternative:
    // await new Promise(resolve=> {
    //     setTimeout(() => {
    //         resolve();
    //     }, 300);
    // })

    expect(axios.get).toHaveBeenCalledTimes(1) // probably is better to use "const spy = jest.spyOn(commonActions, 'getAction')" and then "expect(spy).toHaveBeenCalledTimes(1)"
    expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
    expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(
      `${ACTIONS.ALL_POEMS}_rejected`
    )
    expect((dispatch as jest.Mock).mock.calls[1][0].payload).toBe(
      'Network error'
    )
  })

  test('Should dispatch response when axios returns data correctly', async () => {
    // this is beacuse we use Axios.create
    ;(axios.create as jest.Mock).mockReturnThis()
    ;(axios.get as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ data: 'poem1' })
    )

    const options = { fetch: true }
    await waitFor(() => getAllPoemsAction({ params: {}, options })(dispatch))

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.ALL_POEMS}_request`
    )
    expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
    expect((dispatch as jest.Mock).mock.calls[1][0].type).toStrictEqual(
      `${ACTIONS.ALL_POEMS}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[1][0].payload).toEqual('poem1')
  })
})

describe('updatePoemsListCacheAfterLikePoemAction', () => {
  let dispatch: AppDispatch
  beforeEach(() => {
    dispatch = jest.fn()
  })
  afterEach(() => {
    // doing this in an afterAll could lead to not reset dispatch calls number so the latter
    // tests could fail
    ;(dispatch as jest.Mock).mockClear()
  })

  test('Should update cache when disliking a poem', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '1',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1', '4']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['4']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      poemsListQuery: { item: initialState }
    })

    updatePoemsListCacheAfterLikePoemAction({ poemId: '1', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.POEMS_LIST}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
  test('Should update cache when liking a poem', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '2',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['1', '2']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      poemsListQuery: { item: initialState }
    })

    updatePoemsListCacheAfterLikePoemAction({ poemId: '1', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.POEMS_LIST}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
  test('Should do nothing when liking a poem that does not exist', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '1',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['1']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      poemsListQuery: { item: initialState }
    })

    updatePoemsListCacheAfterLikePoemAction({ poemId: '3', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.POEMS_LIST}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
})

describe('updateRankingCacheAfterLikePoemAction', () => {
  let dispatch: AppDispatch
  beforeEach(() => {
    dispatch = jest.fn()
  })
  afterEach(() => {
    // doing this in an afterAll could lead to not reset dispatch calls number so the latter
    // tests could fail
    ;(dispatch as jest.Mock).mockClear()
  })

  test('Should update cache when disliking a poem', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '1',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1', '4']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['4']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      rankingQuery: { item: initialState }
    })

    updateRankingCacheAfterLikePoemAction({ poemId: '1', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.RANKING}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
  test('Should update cache when liking a poem', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '2',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['1', '2']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      rankingQuery: { item: initialState }
    })

    updateRankingCacheAfterLikePoemAction({ poemId: '1', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.RANKING}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
})

describe('updateAllPoemsCacheAfterLikePoemAction', () => {
  let dispatch: AppDispatch
  beforeEach(() => {
    dispatch = jest.fn()
  })
  afterEach(() => {
    // doing this in an afterAll could lead to not reset dispatch calls number so the latter
    // tests could fail
    ;(dispatch as jest.Mock).mockClear()
  })

  test('Should update cache when disliking a poem', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '1',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1', '4']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['4']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      allPoemsQuery: { item: initialState }
    })

    updateAllPoemsCacheAfterLikePoemAction({ poemId: '1', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.ALL_POEMS}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
  test('Should update cache when liking a poem', () => {
    const context = {
      elementToEdit: '1',
      user: 'whatever',
      userId: '2',
      username: 'username',
      picture: '1.jpg',
      config: {},
      adminId: '1',
      setState: () => {}
    }

    const initialState = [
      {
        id: '1',
        likes: ['1']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]
    const finalState = [
      {
        id: '1',
        likes: ['1', '2']
      },
      {
        id: '2',
        likes: ['12', '14']
      }
    ]

    ;(store.getState as jest.Mock).mockReturnValueOnce({
      allPoemsQuery: { item: initialState }
    })

    updateAllPoemsCacheAfterLikePoemAction({ poemId: '1', context })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.ALL_POEMS}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
  })
})

describe('createPoemAction', () => {
  let dispatch: AppDispatch

  const context = {
    elementToEdit: '1',
    user: 'whatever',
    userId: '2',
    username: 'username',
    picture: '1.jpg',
    config: {
      headers: {
        Authorization: 'Bearer 123'
      }
    },
    adminId: '1',
    setState: () => {}
  }

  const poem = {
    id: '',
    author: 'author1',
    date: '01012001',
    genre: 'love',
    likes: ['1'],
    picture: '1.jpg',
    poem: 'This is a poem',
    title: 'title1',
    userId: '1'
  }

  const callbacks = {
    error: () => {
      console.log('error')
    },
    reset: () => {
      console.log('reset')
    },
    success: () => {
      console.log('success')
    }
  }

  beforeEach(() => {
    dispatch = jest.fn()
  })
  afterEach(() => {
    // doing this in an afterAll could lead to not reset dispatch calls number so the latter
    // tests could fail
    ;(dispatch as jest.Mock).mockClear()
  })

  test('should call postAction - no fetch', () => {
    const spy = jest.spyOn(commonActions, 'postAction')
    const options = { fetch: false }

    createPoemAction({ poem, context, callbacks, options })(dispatch)

    expect(spy).toHaveBeenCalled()
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      type: ACTIONS.CREATE_POEM,
      url: API_ENDPOINTS.POEMS,
      dispatch,
      data: poem,
      options,
      callbacks,
      config: context.config
    })
    spy.mockRestore()
  })

  test('dispatches - reset', () => {
    const options = { fetch: false, reset: true }

    createPoemAction({ poem, context, callbacks, options })(dispatch)

    expect(dispatch).toHaveBeenCalled()
  })

  test('Should dispatch right type - reset', () => {
    const options = { fetch: false, reset: true }

    createPoemAction({ poem, context, callbacks, options })(dispatch)

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toBe(
      `${ACTIONS.CREATE_POEM}_reset`
    )
  })

  test('Should dispatch error when axios throws a generic error', async () => {
    ;(axios.create as jest.Mock).mockReturnThis()
    ;(axios.post as jest.Mock).mockReturnValueOnce(
      Promise.reject({ response: 'some error' })
    )

    const options = { fetch: true }

    // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
    await waitFor(() =>
      createPoemAction({ poem, context, callbacks, options })(dispatch)
    )

    expect(axios.post).toHaveBeenCalledTimes(1) // probably is better to use "const spy = jest.spyOn(commonActions, 'postAction')" and then "expect(spy).toHaveBeenCalledTimes(1)"
    expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
    expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(
      `${ACTIONS.CREATE_POEM}_rejected`
    )
    expect((dispatch as jest.Mock).mock.calls[1][0].payload.response).toBe(
      'some error'
    )
  })

  test('Should dispatch response when axios returns data correctly', async () => {
    // this is beacuse we use Axios.create
    ;(axios.create as jest.Mock).mockReturnThis()
    ;(axios.post as jest.Mock).mockReturnValueOnce(
      Promise.resolve({ data: 'poem1' })
    )

    const options = { fetch: true }
    await waitFor(() =>
      createPoemAction({ poem, context, callbacks, options })(dispatch)
    )

    expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(
      `${ACTIONS.CREATE_POEM}_request`
    )
    expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
    expect((dispatch as jest.Mock).mock.calls[1][0].type).toStrictEqual(
      `${ACTIONS.CREATE_POEM}_fulfilled`
    )
    expect((dispatch as jest.Mock).mock.calls[1][0].payload).toEqual('poem1')
  })
})
