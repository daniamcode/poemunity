import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MyFavouritePoems from './MyFavouritePoems'
import { AppContext } from '../../App'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('MyFavouritePoems Component - Pagination', () => {
    let store

    beforeEach(() => {
        store = mockStore({
            myFavouritePoemsQuery: {
                isFetching: false,
                isError: false,
                item: [],
                page: 1,
                hasMore: false,
                total: 0
            }
        })
    })

    test('should render loading spinner when fetching initial data', () => {
        store = mockStore({
            myFavouritePoemsQuery: {
                isFetching: true,
                isError: false,
                item: [],
                page: undefined,
                hasMore: false,
                total: 0
            }
        })

        const mockContext = {
            userId: 'user-123',
            username: 'testuser'
        }

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AppContext.Provider value={mockContext}>
                        <MyFavouritePoems />
                    </AppContext.Provider>
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('should dispatch getMyFavouritePoemsAction on mount with likedBy param', () => {
        const mockContext = {
            userId: 'user-123',
            username: 'testuser'
        }

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AppContext.Provider value={mockContext}>
                        <MyFavouritePoems />
                    </AppContext.Provider>
                </BrowserRouter>
            </Provider>
        )

        const actions = store.getActions()
        expect(actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: expect.stringContaining('my-favourite-poems')
                })
            ])
        )
    })

    test('should render liked poems list when data is available', () => {
        store = mockStore({
            myFavouritePoemsQuery: {
                isFetching: false,
                isError: false,
                item: [
                    {
                        id: '1',
                        title: 'Liked Poem',
                        author: 'otheruser',
                        poem: 'Great content',
                        likes: ['user-123'],
                        date: new Date().toISOString(),
                        picture: 'test.jpg'
                    }
                ],
                page: 1,
                hasMore: false,
                total: 1
            }
        })

        const mockContext = {
            userId: 'user-123',
            username: 'testuser'
        }

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AppContext.Provider value={mockContext}>
                        <MyFavouritePoems />
                    </AppContext.Provider>
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByText('Liked Poem')).toBeInTheDocument()
    })

    // TODO: Add more tests for:
    // - Infinite scroll behavior
    // - Load more when scrolling
    // - Like/unlike functionality (should refresh list)
    // - Delete poem functionality
    // - Search/filter functionality
})
