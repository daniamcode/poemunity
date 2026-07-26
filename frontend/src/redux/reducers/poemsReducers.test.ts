import * as commonReducers from './commonReducers'
import { allPoemsQuery } from './poemsReducers'

import { ACTIONS } from './poemsReducers'

// jest.mock('redux');

describe('Poems reducer - allPoemsQuery', () => {
    const poem1 = {
        id: '1',
        author: 'author1',
        date: 'date1',
        genre: 'genre1',
        likes: ['1'],
        picture: 'picture1',
        poem: 'poem1',
        title: 'title1',
        userId: 'userId1'
    }
    const poem2 = {
        id: '2',
        author: 'author2',
        date: 'date2',
        genre: 'genre2',
        likes: ['2'],
        picture: 'picture2',
        poem: 'poem2',
        title: 'title2',
        userId: 'userId2'
    }
    const poem3 = {
        id: '3',
        author: 'author3',
        date: 'date3',
        genre: 'genre3',
        likes: ['3'],
        picture: 'picture3',
        poem: 'poem3',
        title: 'title3',
        userId: 'userId3'
    }

    test('should call commonReducer', () => {
        const spy = jest.spyOn(commonReducers, 'commonReducer')
        allPoemsQuery(undefined, {
            type: 'whatever'
        })
        expect(spy).toHaveBeenCalled()
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            state: {
                isFetching: false,
                isError: false
            },
            action: {
                type: 'whatever'
            },
            actionType: ACTIONS.ALL_POEMS
        })
        spy.mockRestore()
    })
    test('should return the initial state with resetAction', () => {
        const result = allPoemsQuery(undefined, {
            type: `${ACTIONS.ALL_POEMS}_reset`
        })
        expect(result).toEqual({
            isFetching: false,
            isError: false
        })
    })
    test('should return the initial state with resetAction calling abort', () => {
        const prevState = {
            isFetching: false,
            isError: false,
            abortController: new AbortController()
        }
        const abortSpy = jest.spyOn(prevState.abortController, 'abort')

        const result = allPoemsQuery(prevState, {
            type: `${ACTIONS.ALL_POEMS}_reset`
        })

        expect(result).toEqual({
            isFetching: false,
            isError: false
        })
        expect(abortSpy).toHaveBeenCalledTimes(1)
        abortSpy.mockRestore()
    })
    test('should return loading with requestAction', () => {
        const result = allPoemsQuery(undefined, {
            type: `${ACTIONS.ALL_POEMS}_request`
        })

        expect(result).toEqual({
            isFetching: true,
            isError: false
        })
    })
    test('should return loading true with requestAction when calling abort, and abort should be called', () => {
        const prevState = {
            isFetching: false,
            isError: false,
            abortController: new AbortController(),
            abortRequests: true
        }
        const abortSpy = jest.spyOn(prevState.abortController, 'abort')
        const result = allPoemsQuery(prevState, {
            type: `${ACTIONS.ALL_POEMS}_request`
        })

        expect(result).toEqual({
            ...prevState,
            isFetching: true
        })
        expect(abortSpy).toHaveBeenCalledTimes(1)
        abortSpy.mockRestore()
    })
    test('should return correct state with fulfilledAction - with initialState', () => {
        const result = allPoemsQuery(undefined, {
            type: `${ACTIONS.ALL_POEMS}_fulfilled`,
            payload: [poem1, poem2]
        })
        // The cache stores poem ids; the full poems live in poemEntities.
        expect(result).toEqual({
            isFetching: false,
            isError: false,
            item: ['1', '2']
        })
        expect(result).toStrictEqual({
            err: undefined,
            abortController: undefined,
            isFetching: false,
            isError: false,
            item: ['1', '2']
        })
    })
    test('should return correct state with fulfilledAction - with previous state', () => {
        const prevState = {
            isFetching: false,
            isError: false,
            item: [poem1.id]
        }
        const result = allPoemsQuery(prevState, {
            type: `${ACTIONS.ALL_POEMS}_fulfilled`,
            payload: [poem2, poem3]
        })
        // the previous state is not considered
        expect(result).toEqual({
            isFetching: false,
            isError: false,
            item: ['2', '3']
        })
    })
    test('should return correct state with rejectedAction', () => {
        const result = allPoemsQuery(undefined, {
            type: `${ACTIONS.ALL_POEMS}_rejected`,
            payload: [poem1, poem2]
        })
        expect(result).toEqual({
            isFetching: false,
            isError: true,
            err: [poem1, poem2]
        })
        expect(result).toStrictEqual({
            abortController: undefined,
            isFetching: false,
            isError: true,
            err: [poem1, poem2]
        })
    })
})

describe('Poems reducer - poemsListQuery cache update bug', () => {
    const poem1 = {
        id: 'poem1',
        author: 'author1',
        date: 'date1',
        genre: 'genre1',
        likes: [],
        picture: 'picture1',
        poem: 'poem1',
        title: 'title1',
        userId: 'userId1',
        origin: 'user'
    }
    const poem2 = {
        id: 'poem2',
        author: 'author2',
        date: 'date2',
        genre: 'genre2',
        likes: [],
        picture: 'picture2',
        poem: 'poem2',
        title: 'title2',
        userId: 'userId2',
        origin: 'user'
    }

    test('should not duplicate poems when updating cache on page 1', () => {
        const { poemsListQuery } = require('./poemsReducers')

        // Simulate loading first page
        const stateAfterPage1 = poemsListQuery(undefined, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [poem1, poem2],
                page: 1,
                hasMore: false,
                total: 2,
                totalPages: 1
            }
        })

        expect(stateAfterPage1.item).toHaveLength(2)
        expect(stateAfterPage1.page).toBe(1)

        // Simulate cache update (like/unlike) on page 1
        const updatedPoem1 = { ...poem1, likes: ['user123'] }
        const stateAfterCacheUpdate = poemsListQuery(stateAfterPage1, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [updatedPoem1, poem2],
                page: 1,
                hasMore: false,
                total: 2,
                totalPages: 1
            }
        })

        // Should replace, not append (no duplicates). The cache holds ids now;
        // the updated likes live on the poem entity, not in this cache.
        expect(stateAfterCacheUpdate.item).toHaveLength(2)
        expect(stateAfterCacheUpdate.item).toEqual(['poem1', 'poem2'])
    })

    test('should not duplicate poems when updating cache on page 2+', () => {
        const { poemsListQuery } = require('./poemsReducers')

        const poem3 = { ...poem1, id: 'poem3', title: 'title3' }
        const poem4 = { ...poem2, id: 'poem4', title: 'title4' }

        // Simulate loading page 1
        const stateAfterPage1 = poemsListQuery(undefined, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [poem1, poem2],
                page: 1,
                hasMore: true,
                total: 4,
                totalPages: 2
            }
        })

        expect(stateAfterPage1.item).toHaveLength(2)

        // Simulate loading page 2 (append)
        const stateAfterPage2 = poemsListQuery(stateAfterPage1, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [poem3, poem4],
                page: 2,
                hasMore: false,
                total: 4,
                totalPages: 2
            }
        })

        expect(stateAfterPage2.item).toHaveLength(4)
        expect(stateAfterPage2.page).toBe(2)

        // Simulate cache update (like/unlike) while on page 2
        // The cache update sends ALL current poems (page 1 + page 2) with updated likes
        const updatedPoem1 = { ...poem1, likes: ['user123'] }
        const stateAfterCacheUpdate = poemsListQuery(stateAfterPage2, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [updatedPoem1, poem2, poem3, poem4],
                page: 2, // Still on page 2
                hasMore: false,
                total: 4,
                totalPages: 2
            }
        })

        // Should replace, not append (no duplicates)
        // This is the fix: detect cache update by checking if state.page === page && poems.length <= state.item.length
        expect(stateAfterCacheUpdate.item).toHaveLength(4)
        expect(stateAfterCacheUpdate.item[0]).toBe('poem1')

        // Verify no duplicates (item is an array of poem ids)
        const ids = stateAfterCacheUpdate.item
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(4)
    })

    test('should append new poems when loading next page (not a cache update)', () => {
        const { poemsListQuery } = require('./poemsReducers')

        const poem3 = { ...poem1, id: 'poem3', title: 'title3' }

        // Page 1
        const stateAfterPage1 = poemsListQuery(undefined, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [poem1, poem2],
                page: 1,
                hasMore: true,
                total: 3,
                totalPages: 2
            }
        })

        expect(stateAfterPage1.item).toHaveLength(2)

        // Page 2 - should append (different length, different page)
        const stateAfterPage2 = poemsListQuery(stateAfterPage1, {
            type: 'poems-list_fulfilled',
            payload: {
                poems: [poem3],
                page: 2,
                hasMore: false,
                total: 3,
                totalPages: 2
            }
        })

        // Should append, not replace
        expect(stateAfterPage2.item).toHaveLength(3)
        expect(stateAfterPage2.page).toBe(2)
    })
})
