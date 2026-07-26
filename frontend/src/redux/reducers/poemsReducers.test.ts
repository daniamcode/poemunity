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
