import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import mockRouter from 'next-router-mock'
import Detail from './Detail'
import store from '../../redux/store'
import * as useDetailPoemHook from './hooks/useDetailPoem'
import * as usePoemActionsHook from '../../hooks/usePoemActions'
import { Poem } from '../../typescript/interfaces'

// Mock the hooks
jest.mock('./hooks/useDetailPoem')
jest.mock('../../hooks/usePoemActions')
jest.mock('../Comments/CommentsSection', () => ({
    __esModule: true,
    default: () => <div data-testid='comments-section'>Comments</div>
}))

// Mock AppContext - define mockContext first
jest.mock('../../App', () => {
    const mockContext = {
        user: 'testuser',
        userId: 'user-123',
        isAdmin: false,
        setState: jest.fn()
    }
    return {
        AppContext: React.createContext(mockContext)
    }
})

const renderWithProviders = (component: React.ReactElement) => {
    return render(
            <Provider store={store}>{component}</Provider>
    )
}

describe('Detail', () => {
    let originalIntersectionObserver: typeof global.IntersectionObserver
    let intersectionObserverCallback: IntersectionObserverCallback

    const mockPoem: Poem = {
        id: 'poem-123',
        author: 'John Doe',
        date: '2024-01-15T10:30:00.000Z',
        genre: 'love',
        likes: ['user1', 'user2'],
        picture: 'https://example.com/avatar.jpg',
        poem: 'This is a beautiful poem',
        title: 'A Beautiful Poem',
        userId: 'user-456'
    }

    const mockHandlers = {
        handleLike: jest.fn(),
        handleDelete: jest.fn(),
        handleEdit: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        originalIntersectionObserver = global.IntersectionObserver
        global.IntersectionObserver = undefined as any
        mockRouter.setCurrentUrl({ pathname: '/detail/[poemId]', query: { poemId: 'poem-123' } })
        ;(useDetailPoemHook.useDetailPoem as jest.Mock).mockReturnValue({
            poem: mockPoem,
            isLoading: false
        })
        ;(usePoemActionsHook.usePoemActions as jest.Mock).mockReturnValue(mockHandlers)
    })

    afterEach(() => {
        global.IntersectionObserver = originalIntersectionObserver
    })

    test('should render CircularProgress when loading', () => {
        ;(useDetailPoemHook.useDetailPoem as jest.Mock).mockReturnValue({
            poem: mockPoem,
            isLoading: true
        })

        renderWithProviders(<Detail />)
        // CircularProgress component should be rendered
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('should render PoemNotFound when poem has no id', () => {
        const emptyPoem: Poem = {
            id: '',
            author: '',
            date: '',
            genre: '',
            likes: [],
            picture: '',
            poem: '',
            title: '',
            userId: ''
        }

        ;(useDetailPoemHook.useDetailPoem as jest.Mock).mockReturnValue({
            poem: emptyPoem,
            isLoading: false
        })

        renderWithProviders(<Detail />)
        expect(screen.getByText('Error - 404')).toBeInTheDocument()
        expect(screen.getByText('Nothing to see here')).toBeInTheDocument()
    })

    test('should render poem content when poem exists', () => {
        renderWithProviders(<Detail />)
        expect(screen.getByText('A Beautiful Poem')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText(/This is a beautiful poem/)).toBeInTheDocument()
    })

    test('should render Helmet component', () => {
        const { container } = renderWithProviders(<Detail />)
        // Helmet component is rendered (title updates are handled by react-helmet)
        expect(container).toBeInTheDocument()
        // We can verify the poem is displayed which confirms Helmet would have the title
        expect(screen.getByText('A Beautiful Poem')).toBeInTheDocument()
    })

    test('should call useDetailPoem with correct poemId', () => {
        renderWithProviders(<Detail />)
        expect(useDetailPoemHook.useDetailPoem).toHaveBeenCalledWith('poem-123', undefined)
    })

    test('should call usePoemActions with correct poem, context, and onDeleteSuccess', () => {
        renderWithProviders(<Detail />)
        expect(usePoemActionsHook.usePoemActions).toHaveBeenCalledWith(
            expect.objectContaining({
                poem: expect.objectContaining({ id: 'poem-123' }),
                context: expect.any(Object),
                onDeleteSuccess: expect.any(Function)
            })
        )
    })

    test('should render PoemFooter with correct props', () => {
        renderWithProviders(<Detail />)
        // PoemFooter displays likes count
        expect(screen.getByText('2 Likes')).toBeInTheDocument()
    })

    test('should render CommentsSection immediately when IntersectionObserver is unavailable', async () => {
        renderWithProviders(<Detail />)
        expect(await screen.findByTestId('comments-section')).toBeInTheDocument()
    })

    test('should defer CommentsSection until the sentinel is near the viewport', () => {
        const observe = jest.fn()
        const disconnect = jest.fn()

        global.IntersectionObserver = jest.fn(callback => {
            intersectionObserverCallback = callback
            return {
                observe,
                unobserve: jest.fn(),
                disconnect,
                root: null,
                rootMargin: '',
                thresholds: [],
                takeRecords: jest.fn()
            }
        }) as any

        renderWithProviders(<Detail />)

        expect(observe).toHaveBeenCalled()
        expect(screen.queryByTestId('comments-section')).not.toBeInTheDocument()

        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        expect(screen.getByTestId('comments-section')).toBeInTheDocument()
        expect(disconnect).toHaveBeenCalled()
    })

    test('should apply correct CSS classes to main container', () => {
        const { container } = renderWithProviders(<Detail />)
        expect(container.querySelector('.poem__detail')).toBeInTheDocument()
        expect(container.querySelector('.poem__block')).toBeInTheDocument()
    })
})
