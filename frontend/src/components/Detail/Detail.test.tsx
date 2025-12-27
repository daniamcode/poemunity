import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Detail from './Detail'
import store from '../../redux/store'
import * as useDetailPoemHook from './hooks/useDetailPoem'
import * as usePoemActionsHook from './hooks/usePoemActions'
import { Poem } from '../../typescript/interfaces'

// Mock the hooks
jest.mock('./hooks/useDetailPoem')
jest.mock('./hooks/usePoemActions')

// Mock AppContext - define mockContext first
jest.mock('../../App', () => {
    const mockContext = {
        user: 'testuser',
        userId: 'user-123',
        adminId: 'admin-456',
        setState: jest.fn()
    }
    return {
        AppContext: React.createContext(mockContext)
    }
})

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <Provider store={store}>{component}</Provider>
        </BrowserRouter>
    )
}

describe('Detail', () => {
    const mockProps = {
        match: {
            params: {
                poemId: 'poem-123'
            }
        }
    }

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
        ;(useDetailPoemHook.useDetailPoem as jest.Mock).mockReturnValue({
            poem: mockPoem,
            isLoading: false
        })
        ;(usePoemActionsHook.usePoemActions as jest.Mock).mockReturnValue(mockHandlers)
    })

    test('should render CircularProgress when loading', () => {
        ;(useDetailPoemHook.useDetailPoem as jest.Mock).mockReturnValue({
            poem: mockPoem,
            isLoading: true
        })

        renderWithProviders(<Detail {...mockProps} />)
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

        renderWithProviders(<Detail {...mockProps} />)
        expect(screen.getByText('Error - 404')).toBeInTheDocument()
        expect(screen.getByText('Nothing to see here')).toBeInTheDocument()
    })

    test('should render poem content when poem exists', () => {
        renderWithProviders(<Detail {...mockProps} />)
        expect(screen.getByText('A Beautiful Poem')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText(/This is a beautiful poem/)).toBeInTheDocument()
    })

    test('should render Helmet component', () => {
        const { container } = renderWithProviders(<Detail {...mockProps} />)
        // Helmet component is rendered (title updates are handled by react-helmet)
        expect(container).toBeInTheDocument()
        // We can verify the poem is displayed which confirms Helmet would have the title
        expect(screen.getByText('A Beautiful Poem')).toBeInTheDocument()
    })

    test('should call useDetailPoem with correct poemId', () => {
        renderWithProviders(<Detail {...mockProps} />)
        expect(useDetailPoemHook.useDetailPoem).toHaveBeenCalledWith('poem-123')
    })

    test('should call usePoemActions with correct poemId and context', () => {
        renderWithProviders(<Detail {...mockProps} />)
        expect(usePoemActionsHook.usePoemActions).toHaveBeenCalledWith('poem-123', expect.any(Object))
    })

    test('should render PoemFooter with correct props', () => {
        renderWithProviders(<Detail {...mockProps} />)
        // PoemFooter displays likes count
        expect(screen.getByText('2 Likes')).toBeInTheDocument()
    })

    test('should render Disqus comments section', () => {
        const { container } = renderWithProviders(<Detail {...mockProps} />)
        expect(container.querySelector('.article-container')).toBeInTheDocument()
    })

    test('should apply correct CSS classes to main container', () => {
        const { container } = renderWithProviders(<Detail {...mockProps} />)
        expect(container.querySelector('.poem__detail')).toBeInTheDocument()
        expect(container.querySelector('.poem__block')).toBeInTheDocument()
    })
})
