import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MyPoems from './MyPoems'
import { AppContext } from '../../App'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('MyPoems Component - Pagination', () => {
    let store

    beforeEach(() => {
        store = mockStore({
            myPoemsQuery: {
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
            myPoemsQuery: {
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
                        <MyPoems />
                    </AppContext.Provider>
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('should dispatch getMyPoemsAction on mount with pagination params', () => {
        const mockContext = {
            userId: 'user-123',
            username: 'testuser'
        }

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <AppContext.Provider value={mockContext}>
                        <MyPoems />
                    </AppContext.Provider>
                </BrowserRouter>
            </Provider>
        )

        const actions = store.getActions()
        expect(actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: expect.stringContaining('my-poems')
                })
            ])
        )
    })

    test('should render poems list when data is available', () => {
        store = mockStore({
            myPoemsQuery: {
                isFetching: false,
                isError: false,
                item: [
                    {
                        id: '1',
                        title: 'Test Poem',
                        author: 'testuser',
                        poem: 'Test content',
                        likes: [],
                        date: new Date().toISOString()
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
                        <MyPoems />
                    </AppContext.Provider>
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByText('Test Poem')).toBeInTheDocument()
    })

    // TODO: Add more tests for:
    // - Infinite scroll behavior
    // - Load more when scrolling
    // - Delete poem functionality
    // - Edit poem functionality
    // - Search/filter functionality
})
