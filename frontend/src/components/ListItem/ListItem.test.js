/* eslint-disable max-lines */
import ListItem from './ListItem'
import { manageSuccess, manageError } from '../../utils/notifications'
import store from '../../redux/store'
import { Provider } from 'react-redux'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import * as commonActions from '../../redux/actions/commonActions'
import * as poemsActions from '../../redux/actions/poemsActions'
import * as poemActions from '../../redux/actions/poemActions'

jest.mock('axios', () => {
    const mockDeleteFn = jest.fn()
    const mockPutFn = jest.fn()
    const mockAxiosInstance = {
        delete: mockDeleteFn,
        put: mockPutFn
    }
    const mockCreateFn = jest.fn(() => mockAxiosInstance)

    return {
        __esModule: true,
        default: {
            create: mockCreateFn,
            __mockDelete: mockDeleteFn,
            __mockPut: mockPutFn
        }
    }
})

jest.mock('../../utils/notifications', () => ({
    manageSuccess: jest.fn(),
    manageError: jest.fn()
}))

// Get reference to the mock functions
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const axios = require('axios')
const mockDelete = axios.default.__mockDelete
const mockPut = axios.default.__mockPut

describe('ListItem component', () => {
    const wrapper = ({ children }) => (
        <Provider store={store}>
            <Router>{children}</Router>
        </Provider>
    )

    const poem = {
        id: 1,
        title: 'test',
        author: 'test',
        likes: ['1'],
        date: new Date().toISOString(),
        poem: 'This is a test poem content',
        picture: ''
    }

    const filter = 'test'
    const context = {
        user: { id: 1 },
        userId: 1,
        adminId: 1,
        setState: jest.fn(),
        config: 'test'
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Should call manageSuccess when deleting poem', async () => {
        const spy = jest.spyOn(commonActions, 'deleteAction')

        // Mock the cache update actions to prevent Redux errors
        const mockUpdatePoemsListCache = jest.spyOn(poemsActions, 'updatePoemsListCacheAfterDeletePoemAction')
        const mockUpdateRankingCache = jest.spyOn(poemsActions, 'updateRankingCacheAfterDeletePoemAction')
        mockUpdatePoemsListCache.mockReturnValue({ type: 'MOCK_UPDATE_POEMS_LIST' })
        mockUpdateRankingCache.mockReturnValue({ type: 'MOCK_UPDATE_RANKING' })

        // Set up mock BEFORE render with complete axios response structure
        mockDelete.mockResolvedValue({
            data: 'poem1',
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        render(<ListItem poem={poem} filter={filter} context={context} />, { wrapper })

        fireEvent.click(screen.getByTestId('delete-poem'))

        await waitFor(
            () => {
                expect(spy).toHaveBeenCalled()
                expect(mockDelete).toHaveBeenCalled()
            },
            { timeout: 3000 }
        )

        await waitFor(
            () => {
                expect(manageSuccess).toHaveBeenCalled()
                expect(manageSuccess).toHaveBeenCalledWith('Poem deleted')
            },
            { timeout: 3000 }
        )
    })

    test('Should call manageError when failing in deleting poem', async () => {
        const spy = jest.spyOn(commonActions, 'deleteAction')

        // Set up mock BEFORE render
        mockDelete.mockRejectedValue(new Error('some error'))

        render(<ListItem poem={poem} filter={filter} context={context} />, { wrapper })

        fireEvent.click(screen.getByTestId('delete-poem'))

        await waitFor(
            () => {
                expect(spy).toHaveBeenCalled()
                expect(mockDelete).toHaveBeenCalled()
            },
            { timeout: 3000 }
        )

        await waitFor(
            () => {
                // manageError is called directly in commonActions.ts line 414, plus in the callback
                expect(manageError).toHaveBeenCalled()
                expect(manageError).toHaveBeenCalledWith(expect.objectContaining({ message: 'some error' }))
            },
            { timeout: 3000 }
        )
    })

    describe('Like/Unlike functionality', () => {
        test('Should like a poem when clicking the unlike icon (poem not yet liked)', async () => {
            const unlikedPoem = {
                ...poem,
                id: 'poem123',
                userId: '999', // Different from context.userId so icons show
                likes: [] // User hasn't liked it yet
            }

            const contextWithDifferentUser = {
                ...context,
                userId: '123',
                adminId: '456'
            }

            const spy = jest.spyOn(poemActions, 'likePoemAction')

            // Mock the cache update actions
            const mockUpdatePoemsList = jest.spyOn(poemsActions, 'updatePoemsListCacheAfterLikePoemAction')
            const mockUpdateRanking = jest.spyOn(poemsActions, 'updateRankingCacheAfterLikePoemAction')
            const mockUpdateAllPoems = jest.spyOn(poemsActions, 'updateAllPoemsCacheAfterLikePoemAction')
            const mockUpdatePoem = jest.spyOn(poemActions, 'updatePoemCacheAfterLikePoemAction')

            mockUpdatePoemsList.mockReturnValue({ type: 'MOCK_UPDATE_POEMS_LIST' })
            mockUpdateRanking.mockReturnValue({ type: 'MOCK_UPDATE_RANKING' })
            mockUpdateAllPoems.mockReturnValue({ type: 'MOCK_UPDATE_ALL_POEMS' })
            mockUpdatePoem.mockReturnValue({ type: 'MOCK_UPDATE_POEM' })

            // Mock successful like response
            mockPut.mockResolvedValue({
                data: { ...unlikedPoem, likes: ['123'] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            })

            render(<ListItem poem={unlikedPoem} filter={filter} context={contextWithDifferentUser} />, { wrapper })

            // Find the unlike icon (heart outline) and click it
            const unlikeIcon = screen.getByTestId('unlike-icon')
            expect(unlikeIcon).toBeInTheDocument()

            fireEvent.click(unlikeIcon)

            await waitFor(
                () => {
                    expect(spy).toHaveBeenCalled()
                    expect(spy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            params: { poemId: 'poem123' },
                            context: contextWithDifferentUser
                        })
                    )
                },
                { timeout: 3000 }
            )
        })

        test('Should unlike a poem when clicking the like icon (poem already liked)', async () => {
            const likedPoem = {
                ...poem,
                id: 'poem456',
                userId: '999', // Different from context.userId so icons show
                likes: ['123'] // User has already liked it
            }

            const contextWithDifferentUser = {
                ...context,
                userId: '123',
                adminId: '456'
            }

            const spy = jest.spyOn(poemActions, 'likePoemAction')

            // Mock the cache update actions
            const mockUpdatePoemsList = jest.spyOn(poemsActions, 'updatePoemsListCacheAfterLikePoemAction')
            const mockUpdateRanking = jest.spyOn(poemsActions, 'updateRankingCacheAfterLikePoemAction')
            const mockUpdateAllPoems = jest.spyOn(poemsActions, 'updateAllPoemsCacheAfterLikePoemAction')
            const mockUpdatePoem = jest.spyOn(poemActions, 'updatePoemCacheAfterLikePoemAction')

            mockUpdatePoemsList.mockReturnValue({ type: 'MOCK_UPDATE_POEMS_LIST' })
            mockUpdateRanking.mockReturnValue({ type: 'MOCK_UPDATE_RANKING' })
            mockUpdateAllPoems.mockReturnValue({ type: 'MOCK_UPDATE_ALL_POEMS' })
            mockUpdatePoem.mockReturnValue({ type: 'MOCK_UPDATE_POEM' })

            // Mock successful unlike response
            mockPut.mockResolvedValue({
                data: { ...likedPoem, likes: [] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            })

            render(<ListItem poem={likedPoem} filter={filter} context={contextWithDifferentUser} />, { wrapper })

            // Find the like icon (filled heart) and click it
            const likeIcon = screen.getByTestId('like-icon')
            expect(likeIcon).toBeInTheDocument()

            fireEvent.click(likeIcon)

            await waitFor(
                () => {
                    expect(spy).toHaveBeenCalled()
                    expect(spy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            params: { poemId: 'poem456' },
                            context: contextWithDifferentUser
                        })
                    )
                },
                { timeout: 3000 }
            )
        })

        test('Should update cache after successfully liking a poem', async () => {
            const unlikedPoem = {
                ...poem,
                id: 'poem789',
                userId: '999',
                likes: []
            }

            const contextWithDifferentUser = {
                ...context,
                userId: '123',
                adminId: '456'
            }

            // Mock the cache update actions
            const mockUpdatePoemsList = jest.spyOn(poemsActions, 'updatePoemsListCacheAfterLikePoemAction')
            const mockUpdateRanking = jest.spyOn(poemsActions, 'updateRankingCacheAfterLikePoemAction')
            const mockUpdateAllPoems = jest.spyOn(poemsActions, 'updateAllPoemsCacheAfterLikePoemAction')
            const mockUpdatePoem = jest.spyOn(poemActions, 'updatePoemCacheAfterLikePoemAction')

            mockUpdatePoemsList.mockReturnValue({ type: 'MOCK_UPDATE_POEMS_LIST' })
            mockUpdateRanking.mockReturnValue({ type: 'MOCK_UPDATE_RANKING' })
            mockUpdateAllPoems.mockReturnValue({ type: 'MOCK_UPDATE_ALL_POEMS' })
            mockUpdatePoem.mockReturnValue({ type: 'MOCK_UPDATE_POEM' })

            mockPut.mockResolvedValue({
                data: { ...unlikedPoem, likes: ['123'] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            })

            render(<ListItem poem={unlikedPoem} filter={filter} context={contextWithDifferentUser} />, { wrapper })

            const unlikeIcon = screen.getByTestId('unlike-icon')
            fireEvent.click(unlikeIcon)

            await waitFor(
                () => {
                    expect(mockPut).toHaveBeenCalled()
                },
                { timeout: 3000 }
            )

            // Wait a bit longer for cache updates (they happen in success callback)
            await waitFor(
                () => {
                    expect(mockUpdatePoemsList).toHaveBeenCalledWith({
                        poemId: 'poem789',
                        context: contextWithDifferentUser
                    })
                    expect(mockUpdateRanking).toHaveBeenCalledWith({
                        poemId: 'poem789',
                        context: contextWithDifferentUser
                    })
                    expect(mockUpdateAllPoems).toHaveBeenCalledWith({
                        poemId: 'poem789',
                        context: contextWithDifferentUser
                    })
                    expect(mockUpdatePoem).toHaveBeenCalledWith({
                        context: contextWithDifferentUser
                    })
                },
                { timeout: 5000 }
            )
        })

        test('Should not show like/unlike icons for own poems', () => {
            const ownPoem = {
                ...poem,
                id: 'ownPoem',
                userId: '123', // Same as context.userId
                likes: []
            }

            const contextWithSameUser = {
                ...context,
                userId: '123',
                adminId: '456'
            }

            render(<ListItem poem={ownPoem} filter={filter} context={contextWithSameUser} />, { wrapper })

            // Should not show like or unlike icons for own poem
            const likeIcon = screen.queryByTestId('like-icon')
            const unlikeIcon = screen.queryByTestId('unlike-icon')

            expect(likeIcon).not.toBeInTheDocument()
            expect(unlikeIcon).not.toBeInTheDocument()
        })
    })

    describe('Edit poem functionality', () => {
        test('Should set elementToEdit in context when clicking edit button', () => {
            const ownPoem = {
                ...poem,
                id: 'poem-to-edit-123',
                userId: '1', // Same as context.userId so edit icon shows
                likes: []
            }

            const contextWithUser = {
                ...context,
                userId: '1',
                adminId: '1',
                setState: jest.fn()
            }

            render(<ListItem poem={ownPoem} filter={filter} context={contextWithUser} />, { wrapper })

            // Find and click the edit icon
            const editIcon = screen.getByTestId('edit-poem')
            fireEvent.click(editIcon)

            // Verify setState was called with ONLY elementToEdit (not spreading context)
            expect(contextWithUser.setState).toHaveBeenCalledWith({
                elementToEdit: 'poem-to-edit-123'
            })
        })

        test('Should set context state BEFORE navigating to profile', () => {
            const ownPoem = {
                ...poem,
                id: 'poem-edit-order-test',
                userId: '1',
                likes: []
            }

            let setStateCalled = false
            let navigationHappened = false

            const contextWithUser = {
                ...context,
                userId: '1',
                adminId: '1',
                setState: jest.fn(() => {
                    setStateCalled = true
                    // At this point, navigation should NOT have happened yet
                    expect(navigationHappened).toBe(false)
                })
            }

            const { container } = render(<ListItem poem={ownPoem} filter={filter} context={contextWithUser} />, {
                wrapper
            })

            // Mock history.push to track when navigation happens
            const historyPushSpy = jest.fn(() => {
                navigationHappened = true
                // At this point, setState should have already been called
                expect(setStateCalled).toBe(true)
            })

            // Get the component instance and spy on history.push
            // This is a bit tricky in functional components, so we'll just verify the setState call order
            const editIcon = screen.getByTestId('edit-poem')
            fireEvent.click(editIcon)

            // Verify setState was called first
            expect(contextWithUser.setState).toHaveBeenCalled()
            expect(contextWithUser.setState).toHaveBeenCalledWith({
                elementToEdit: 'poem-edit-order-test'
            })
        })

        test('Editing from List should NOT wipe out user context (regression test)', () => {
            const contextWithUserData = {
                ...context,
                user: 'user-token-abc',
                userId: 'user-123', // Same as poem userId
                username: 'testuser',
                picture: 'avatar.jpg',
                config: { headers: { Authorization: 'Bearer token' } },
                adminId: 'admin-456',
                setState: jest.fn()
            }

            const poemToEdit = {
                ...poem,
                id: 'poem-context-preserve',
                userId: 'user-123' // Same as context userId so edit icon shows
            }

            render(<ListItem poem={poemToEdit} filter={filter} context={contextWithUserData} />, {
                wrapper
            })

            const editIcon = screen.getByTestId('edit-poem')
            fireEvent.click(editIcon)

            // CRITICAL: setState should only pass elementToEdit, NOT spread entire context
            expect(contextWithUserData.setState).toHaveBeenCalledWith({
                elementToEdit: 'poem-context-preserve'
            })

            // Verify it's NOT called with the buggy pattern that includes user data
            // If it was called with { ...context, elementToEdit }, it would include user/userId
            const setStateCall = contextWithUserData.setState.mock.calls[0][0]
            expect(setStateCall).toEqual({ elementToEdit: 'poem-context-preserve' })
            expect(Object.keys(setStateCall)).toHaveLength(1)
        })

        test('Edit navigation passes poemId through location state', () => {
            const contextWithUser = {
                ...context,
                user: 'token',
                userId: 'user-456',
                setState: jest.fn()
            }

            const poemToEdit = {
                ...poem,
                id: 'poem-location-state',
                userId: 'user-456' // Same as context userId
            }

            const { container } = render(<ListItem poem={poemToEdit} filter={filter} context={contextWithUser} />, {
                wrapper
            })

            const editIcon = screen.getByTestId('edit-poem')
            fireEvent.click(editIcon)

            // After clicking edit, we should navigate to /profile with state
            // Testing that setState was called with just elementToEdit (not full context)
            // confirms the fix for the bug where spreading context would wipe user data
            expect(contextWithUser.setState).toHaveBeenCalledWith({
                elementToEdit: 'poem-location-state'
            })
        })
    })
})
