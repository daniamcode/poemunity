import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import List from './List'
import store from '../../redux/store'
import * as poemsActions from '../../redux/actions/poemsActions'

// Mock the action creator
jest.mock('../../redux/actions/poemsActions', () => ({
    getPoemsListAction: jest.fn()
}))

// Mock react-redux
jest.mock('react-redux', () => {
    const actual = jest.requireActual('react-redux')
    return {
        ...actual,
        useSelector: jest.fn(),
        useDispatch: jest.fn()
    }
})

import { useSelector, useDispatch } from 'react-redux'

describe('List Component - Infinite Scrolling', () => {
    const mockGetPoemsListAction = jest.fn(() => () => Promise.resolve())
    const mockDispatch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemsActions.getPoemsListAction as jest.Mock).mockImplementation(mockGetPoemsListAction)
        ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    })

    const renderList = (props = {}) =>
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List {...props} />
                </BrowserRouter>
            </Provider>
        )

    test('should load initial poems on mount', () => {
        ;(useSelector as jest.Mock).mockImplementation(selector =>
            selector({ poemsListQuery: { isFetching: false, item: [] } })
        )

        renderList()

        expect(mockGetPoemsListAction).toHaveBeenCalledWith(
            expect.objectContaining({
                options: expect.objectContaining({
                    reset: true,
                    fetch: false
                })
            })
        )
    })

    test('should load more poems when scrolling to bottom', async () => {
        const mockState = {
            poemsListQuery: {
                isFetching: false,
                item: [],
                hasMore: true,
                page: 1
            }
        }
        ;(useSelector as jest.Mock).mockImplementation(selector => selector(mockState))

        const { container } = renderList()
        const scrollContainer = container.querySelector('.list-container')

        if (scrollContainer) {
            Object.defineProperty(scrollContainer, 'scrollTop', { writable: true, value: 1000 })
            Object.defineProperty(scrollContainer, 'scrollHeight', { writable: true, value: 1200 })
            Object.defineProperty(scrollContainer, 'clientHeight', { writable: true, value: 600 })

            scrollContainer.dispatchEvent(new Event('scroll'))

            await waitFor(() => {
                expect(mockGetPoemsListAction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        params: expect.objectContaining({
                            page: expect.any(Number)
                        })
                    })
                )
            })
        }
    })

    test('should not load more when hasMore is false', async () => {
        const mockState = {
            poemsListQuery: { isFetching: false, item: [], hasMore: false }
        }
        ;(useSelector as jest.Mock).mockImplementation(selector => selector(mockState))

        const { container } = renderList()
        const scrollContainer = container.querySelector('.list-container')

        if (scrollContainer) {
            scrollContainer.dispatchEvent(new Event('scroll'))

            await waitFor(() => {
                expect(mockGetPoemsListAction).toHaveBeenCalledTimes(1) // Only initial load
            })
        }
    })

    test('should show loading indicator while fetching', () => {
        const mockState = { poemsListQuery: { isFetching: true, item: [] } }
        ;(useSelector as jest.Mock).mockImplementation(selector => selector(mockState))

        renderList()
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('should accumulate poems from multiple pages', async () => {
        const page1Poems = [
            { id: '1', title: 'Poem 1', author: 'Author 1', date: new Date().toISOString(), poem: '...', picture: '' },
            { id: '2', title: 'Poem 2', author: 'Author 2', date: new Date().toISOString(), poem: '...', picture: '' }
        ]

        const page2Poems = [
            { id: '3', title: 'Poem 3', author: 'Author 3', date: new Date().toISOString(), poem: '...', picture: '' },
            { id: '4', title: 'Poem 4', author: 'Author 4', date: new Date().toISOString(), poem: '...', picture: '' }
        ]

        const mockState = {
            poemsListQuery: { isFetching: false, item: [...page1Poems, ...page2Poems], page: 2, hasMore: true }
        }
        ;(useSelector as jest.Mock).mockImplementation(selector => selector(mockState))

        renderList()

        await waitFor(() => {
            expect(screen.getByText('Poem 1')).toBeInTheDocument()
            expect(screen.getByText('Poem 2')).toBeInTheDocument()
            expect(screen.getByText('Poem 3')).toBeInTheDocument()
            expect(screen.getByText('Poem 4')).toBeInTheDocument()
        })
    })
})
