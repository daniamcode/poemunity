/* eslint-disable max-lines */
import { poemsListQuery, myPoemsQuery, myFavouritePoemsQuery, rankingQuery, ACTIONS } from './poemsReducers'
import { Poem } from '../../typescript/interfaces'

// Helper to create mock poems
const createMockPoem = (id: string, title: string): Poem => ({
    id,
    title,
    author: 'Test Author',
    date: '2024-01-01',
    genre: 'test',
    likes: [],
    picture: 'test.jpg',
    poem: 'Test poem content',
    userId: 'user-123'
})

describe('poemsReducers - Pagination', () => {
    const initialState = {
        isFetching: false,
        isError: false,
        item: undefined
    }

    test('should handle POEMS_LIST_fulfilled with first page', () => {
        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2')],
                total: 50,
                page: 1,
                limit: 20,
                totalPages: 3,
                hasMore: true
            }
        }

        const newState = poemsListQuery(initialState, action)

        expect(newState.item).toEqual(action.payload.poems)
        expect(newState.isFetching).toBe(false)
        expect(newState).toHaveProperty('page', 1)
        expect(newState).toHaveProperty('hasMore', true)
        expect(newState).toHaveProperty('total', 50)
    })

    test('should append poems when loading next page', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2')],
            page: 1,
            hasMore: true,
            total: 50
        }

        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [createMockPoem('3', 'Poem 3'), createMockPoem('4', 'Poem 4')],
                total: 50,
                page: 2,
                limit: 20,
                totalPages: 3,
                hasMore: true
            }
        }

        const newState = poemsListQuery(currentState, action)

        expect(newState.item).toHaveLength(4)
        expect(newState.item?.[0].id).toBe('1')
        expect(newState.item?.[2].id).toBe('3')
        expect(newState.page).toBe(2)
        expect(newState.hasMore).toBe(true)
    })

    test('should set hasMore to false on last page', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Poem 1')],
            page: 2,
            hasMore: true,
            total: 21
        }

        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [createMockPoem('21', 'Poem 21')],
                total: 21,
                page: 3,
                limit: 20,
                totalPages: 3,
                hasMore: false
            }
        }

        const newState = poemsListQuery(currentState, action)

        expect(newState.hasMore).toBe(false)
        expect(newState.page).toBe(3)
    })

    test('should reset state when POEMS_LIST_reset is dispatched', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2')],
            page: 2,
            hasMore: true,
            total: 50
        }

        const action = {
            type: `${ACTIONS.POEMS_LIST}_reset`
        }

        const newState = poemsListQuery(currentState, action)

        expect(newState.item).toBeUndefined()
        expect(newState.page).toBeUndefined()
        expect(newState.hasMore).toBeUndefined()
    })

    test('should set isFetching to true on request', () => {
        const action = {
            type: `${ACTIONS.POEMS_LIST}_request`
        }

        const newState = poemsListQuery(initialState as any, action)

        expect(newState.isFetching).toBe(true)
    })

    test('should set isFetching to false on rejected', () => {
        const currentState = {
            isFetching: true,
            isError: false,
            item: undefined
        }

        const action = {
            type: `${ACTIONS.POEMS_LIST}_rejected`,
            payload: 'Error message'
        }

        const newState = poemsListQuery(currentState, action)

        expect(newState.isFetching).toBe(false)
    })

    test('should handle empty poems array on a page', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Poem 1')],
            page: 1,
            hasMore: true
        }

        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [],
                total: 1,
                page: 2,
                limit: 20,
                totalPages: 1,
                hasMore: false
            }
        }

        const newState = poemsListQuery(currentState, action)

        expect(newState.item).toHaveLength(1) // Still has original poem
        expect(newState.hasMore).toBe(false)
    })

    test('should not duplicate poems if same page loaded twice', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2')],
            page: 1,
            hasMore: true
        }

        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2')],
                total: 50,
                page: 1,
                limit: 20,
                totalPages: 3,
                hasMore: true
            }
        }

        const newState = poemsListQuery(currentState, action)

        // Should replace, not append when page 1 is loaded again
        expect(newState.item).toHaveLength(2)
    })

    test('should handle cache update after deleting a poem', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2'), createMockPoem('3', 'Poem 3')],
            page: 1,
            hasMore: false,
            total: 3,
            totalPages: 1
        }

        // Simulate cache update after deleting poem with id '2'
        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [createMockPoem('1', 'Poem 1'), createMockPoem('3', 'Poem 3')],
                total: 2, // Total decreased by 1
                page: 1,
                limit: 20,
                totalPages: 1,
                hasMore: false
            }
        }

        const newState = poemsListQuery(currentState, action)

        // Should replace with updated array (poem deleted)
        expect(newState.item).toHaveLength(2)
        expect(newState.item?.[0].id).toBe('1')
        expect(newState.item?.[1].id).toBe('3')
        expect(newState.total).toBe(2)
        // Should not have poem with id '2'
        expect(newState.item?.find(p => p.id === '2')).toBeUndefined()
    })

    test('should handle cache update after deleting a poem on page 2', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [
                createMockPoem('1', 'Poem 1'),
                createMockPoem('2', 'Poem 2'),
                createMockPoem('3', 'Poem 3'),
                createMockPoem('4', 'Poem 4')
            ],
            page: 2,
            hasMore: false,
            total: 4,
            totalPages: 1
        }

        // Simulate cache update after deleting poem with id '3' while on page 2
        const action = {
            type: `${ACTIONS.POEMS_LIST}_fulfilled`,
            payload: {
                poems: [createMockPoem('1', 'Poem 1'), createMockPoem('2', 'Poem 2'), createMockPoem('4', 'Poem 4')],
                total: 3, // Total decreased by 1
                page: 2, // Still on page 2
                limit: 20,
                totalPages: 1,
                hasMore: false
            }
        }

        const newState = poemsListQuery(currentState, action)

        // Should replace with updated array (not append because it's a cache update on same page)
        expect(newState.item).toHaveLength(3)
        expect(newState.total).toBe(3)
        expect(newState.item?.find(p => p.id === '3')).toBeUndefined()
    })
})

describe('myPoemsQuery - Pagination', () => {
    const initialState = {
        isFetching: false,
        isError: false,
        item: undefined
    }

    test('should handle MY_POEMS_fulfilled with first page', () => {
        const action = {
            type: `${ACTIONS.MY_POEMS}_fulfilled`,
            payload: {
                poems: [createMockPoem('1', 'My Poem 1'), createMockPoem('2', 'My Poem 2')],
                total: 15,
                page: 1,
                limit: 10,
                totalPages: 2,
                hasMore: true
            }
        }

        const newState = myPoemsQuery(initialState, action)

        expect(newState.item).toEqual(action.payload.poems)
        expect(newState.isFetching).toBe(false)
        expect(newState).toHaveProperty('page', 1)
        expect(newState).toHaveProperty('hasMore', true)
        expect(newState).toHaveProperty('total', 15)
    })

    test('should append poems when loading next page', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'My Poem 1')],
            page: 1,
            hasMore: true,
            total: 15
        }

        const action = {
            type: `${ACTIONS.MY_POEMS}_fulfilled`,
            payload: {
                poems: [createMockPoem('2', 'My Poem 2')],
                total: 15,
                page: 2,
                limit: 10,
                totalPages: 2,
                hasMore: false
            }
        }

        const newState = myPoemsQuery(currentState, action)

        expect(newState.item).toHaveLength(2)
        expect(newState.page).toBe(2)
        expect(newState.hasMore).toBe(false)
    })

    test('should reset state when MY_POEMS_reset is dispatched', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'My Poem 1')],
            page: 1,
            hasMore: true
        }

        const action = {
            type: `${ACTIONS.MY_POEMS}_reset`
        }

        const newState = myPoemsQuery(currentState, action)

        expect(newState.item).toBeUndefined()
        expect(newState.page).toBeUndefined()
    })
})

describe('myFavouritePoemsQuery - Pagination', () => {
    const initialState = {
        isFetching: false,
        isError: false,
        item: undefined
    }

    test('should handle MY_FAVOURITE_POEMS_fulfilled with first page', () => {
        const action = {
            type: `${ACTIONS.MY_FAVOURITE_POEMS}_fulfilled`,
            payload: {
                poems: [createMockPoem('1', 'Favorite 1'), createMockPoem('2', 'Favorite 2')],
                total: 8,
                page: 1,
                limit: 10,
                totalPages: 1,
                hasMore: false
            }
        }

        const newState = myFavouritePoemsQuery(initialState, action)

        expect(newState.item).toEqual(action.payload.poems)
        expect(newState.isFetching).toBe(false)
        expect(newState).toHaveProperty('page', 1)
        expect(newState).toHaveProperty('hasMore', false)
        expect(newState).toHaveProperty('total', 8)
    })

    test('should append poems when loading next page', () => {
        const currentState = {
            isFetching: false,
            isError: false,
            item: [createMockPoem('1', 'Favorite 1')],
            page: 1,
            hasMore: true,
            total: 20
        }

        const action = {
            type: `${ACTIONS.MY_FAVOURITE_POEMS}_fulfilled`,
            payload: {
                poems: [createMockPoem('2', 'Favorite 2')],
                total: 20,
                page: 2,
                limit: 10,
                totalPages: 2,
                hasMore: false
            }
        }

        const newState = myFavouritePoemsQuery(currentState, action)

        expect(newState.item).toHaveLength(2)
        expect(newState.page).toBe(2)
        expect(newState.hasMore).toBe(false)
    })

    test('should set isFetching to true on request', () => {
        const action = {
            type: `${ACTIONS.MY_FAVOURITE_POEMS}_request`
        }

        const newState = myFavouritePoemsQuery(initialState as any, action)

        expect(newState.isFetching).toBe(true)
    })
})

describe('rankingQuery - Non-Paginated', () => {
    const initialState = {
        isFetching: false,
        isError: false,
        item: undefined
    }

    test('should handle RANKING_fulfilled with all poems array', () => {
        const poems = [
            createMockPoem('1', 'Ranked Poem 1'),
            createMockPoem('2', 'Ranked Poem 2'),
            createMockPoem('3', 'Ranked Poem 3')
        ]
        const action = {
            type: `${ACTIONS.RANKING}_fulfilled`,
            payload: poems
        }

        const newState = rankingQuery(initialState, action)

        expect(newState.item).toEqual(poems)
        expect(newState.isFetching).toBe(false)
        expect(newState.item).toHaveLength(3)
    })

    test('should handle large array of poems for ranking calculation', () => {
        const poems = Array.from({ length: 100 }, (_, i) => createMockPoem(`${i}`, `Poem ${i}`))
        const action = {
            type: `${ACTIONS.RANKING}_fulfilled`,
            payload: poems
        }

        const newState = rankingQuery(initialState, action)

        // Should store all poems for accurate ranking calculation
        expect(newState.item).toHaveLength(100)
        expect(newState.isFetching).toBe(false)
    })

    test('should set isFetching to true on request', () => {
        const action = {
            type: `${ACTIONS.RANKING}_request`
        }

        const newState = rankingQuery(initialState as any, action)

        expect(newState.isFetching).toBe(true)
    })

    test('should handle error state', () => {
        const currentState = {
            isFetching: true,
            isError: false,
            item: undefined
        }

        const action = {
            type: `${ACTIONS.RANKING}_rejected`,
            payload: 'Failed to load ranking'
        }

        const newState = rankingQuery(currentState, action)

        expect(newState.isFetching).toBe(false)
        expect(newState.isError).toBe(true)
        expect(newState.err).toBe('Failed to load ranking')
    })

    test('should handle empty poems array', () => {
        const action = {
            type: `${ACTIONS.RANKING}_fulfilled`,
            payload: []
        }

        const newState = rankingQuery(initialState, action)

        expect(newState.item).toEqual([])
        expect(newState.isFetching).toBe(false)
    })
})
