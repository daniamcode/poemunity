import { render, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import Ranking from './Ranking/Ranking'
import MyPoems from './MyPoems/MyPoems'
import MyFavouritePoems from './MyFavouritePoems/MyFavouritePoems'
import Login from './Header/Login'
import Logout from './Header/Logout'
import Profile from './Profile/Profile'
import Header from './Header/Header'
import { BrowserRouter as Router } from 'react-router-dom'
import '@testing-library/jest-dom'
import store from '../redux/store'
import { Provider } from 'react-redux'

describe('Ranking component', () => {
    test('renders', async () => {
        const { container } = render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )
        expect(container).not.toBeNull()
        expect(container.firstChild).toBeTruthy()
    })
})

describe('MyPoems component', () => {
    test('renders', () => {
        const { container } = render(
            <Provider store={store}>
                <MyPoems />
            </Provider>
        )
        expect(container).not.toBeNull()
    })
})

describe('MyFavouritePoems component', () => {
    test('renders', () => {
        const { container } = render(
            <Provider store={store}>
                <MyFavouritePoems />
            </Provider>
        )
        expect(container).not.toBeNull()
    })
})
// mount is for Enzyme, render is for React Testing Library
// todo: refactor the rest of the tests with wrapperFactory
describe('Login component', () => {
    let wrapper = null
    const wrapperFactory = () => {
        const TestWrapper = ({ children }) => (
            <Provider store={store}>
                <Router>{children}</Router>
            </Provider>
        )
        TestWrapper.displayName = 'TestWrapper'
        return TestWrapper
    }

    afterEach(() => {
        // very important, restoreAllMocks works, but clearAllMocks doesn't
        jest.restoreAllMocks()
        wrapper = null
    })

    test('renders', async () => {
        wrapper = wrapperFactory()

        render(<Login />, { wrapper })

        expect(wrapper).not.toBeNull()
        await waitFor(() => {
            expect(document.querySelector('.login')).toBeInTheDocument()
        })
    })
})

describe('Logout component', () => {
    test('renders', () => {
        const { container } = render(
            <Provider store={store}>
                <Logout />
            </Provider>
        )
        expect(container).not.toBeNull()
    })
})

describe('Profile component', () => {
    test('renders', () => {
        const { container } = render(
            <Provider store={store}>
                <Router>
                    <Profile />
                </Router>
            </Provider>
        )
        expect(container).not.toBeNull()
    })
})

describe('Header component', () => {
    test('renders', () => {
        const history = createMemoryHistory()
        const { container } = render(
            <Provider store={store}>
                <Router history={history}>
                    <Header />
                </Router>
            </Provider>
        )
        expect(container).not.toBeNull()
    })
})
