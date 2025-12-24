import { render } from '@testing-library/react'
import App from './App'
import { Provider } from 'react-redux'
import store from './redux/store'
import { BrowserRouter } from 'react-router-dom'

describe('App snapshot', () => {
    test('should match', () => {
        const tree = render(
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        )
        expect(tree.asFragment()).toMatchSnapshot()
    })
})
