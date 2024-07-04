import React from 'react'
import Enzyme, { mount, shallow } from 'enzyme'
import { render, waitFor } from '@testing-library/react'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { createMemoryHistory } from 'history'
import Ranking from './Ranking'
import MyPoems from './MyPoems'
import MyFavouritePoems from './MyFavouritePoems'
import Login from './Login'
import Logout from './Logout'
import Profile from './Profile'
import Header from './Header'
import { BrowserRouter as Router } from 'react-router-dom'
import '@testing-library/jest-dom'
import store from '../redux/store'
import { Provider } from 'react-redux'

describe('Ranking component', () => {
    test('renders with mount', async() => {
        const wrapper = mount(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )
        expect(wrapper).not.toBeNull()
        // this debug is great to see what is inside the component. For example, shallow doesn't render the children but mount does. There's another method called render
        // console.debug(wrapper.debug())

        // better to use a data-test attribute rather than a classname that can be changed accidentaly
        const ranking = wrapper.find(`[data-test='ranking__loading']`)
        expect(ranking.length).toBe(1)
    })
    test('also renders with shallow', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )
        expect(wrapper).not.toBeNull()
    })
})

describe('MyPoems component', () => {
    let wrapper
    beforeEach(() => {
        wrapper = mount(
            <Provider store={store}>
                <MyPoems />
            </Provider>
        )
    })

    test('renders', () => {
        expect(wrapper).not.toBeNull()
    })
})

describe('MyFavouritePoems component', () => {
    let wrapper
    beforeEach(() => {
        wrapper = mount(
            <Provider store={store}>
                <MyFavouritePoems />
            </Provider>
        )
    })

    test('renders', () => {
        expect(wrapper).not.toBeNull()
    })
})
// mount is for Enzyme, render is for React Testing Library
// todo: refactor the rest of the tests with wrapperFactory
describe('Login component', () => {
    let wrapper = null
    const wrapperFactory = () => {
        return ({ children }) => (
            <Provider store={store}>
                <Router>{children}</Router>
            </Provider>
        )
    }

    afterEach(() => {
    // very important, restoreAllMocks works, but clearAllMocks doesn't
        jest.restoreAllMocks()
        wrapper = null
    })

    test('renders', async() => {
        wrapper = wrapperFactory()

        render(<Login />, { wrapper })

        expect(wrapper).not.toBeNull()
        await waitFor(() => {
            expect(document.querySelector('.login')).toBeInTheDocument()
        })
    })
})

describe('Logout component', () => {
    let wrapper
    beforeEach(() => {
        wrapper = mount(
            <Provider store={store}>
                <Logout />
            </Provider>
        )
    })

    test('renders', () => {
        expect(wrapper).not.toBeNull()
    })
})

describe('Profile component', () => {
    let wrapper
    beforeEach(() => {
        wrapper = mount(
            <Provider store={store}>
                <Profile />
            </Provider>
        )
    })

    test('renders', () => {
        expect(wrapper).not.toBeNull()
    })
})

describe('Header component', () => {
    let wrapper
    const history = createMemoryHistory()
    beforeEach(() => {
        wrapper = mount(
            <Provider store={store}>
                <Router history={history}>
                    <Header />
                </Router>
            </Provider>
        )
    })

    test('renders', () => {
        expect(wrapper).not.toBeNull()
    })
})
