import { render, waitFor } from '@testing-library/react'
import App from './App'
import { Provider } from 'react-redux'
import store from './redux/store'
import { BrowserRouter } from 'react-router-dom'

describe('App snapshot', () => {
    test('should match', async () => {
        const tree = render(
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        )
        await waitFor(() => {
            if (!tree.container.querySelector('.dashboard')) throw new Error('dashboard not loaded')
        })
        expect(tree.asFragment()).toMatchSnapshot()
    })
})
