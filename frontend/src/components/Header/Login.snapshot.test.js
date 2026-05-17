import { render } from '@testing-library/react'
import Login from './Login'
import { Provider } from 'react-redux'
import store from '../../redux/store'

function renderLogin(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
                <Login {...props} />
        </Provider>
    )
}

describe('Login', () => {
    let LoginTree

    beforeEach(async () => {
        LoginTree = renderLogin()
    })

    test('should match without id', async () => {
        expect(LoginTree).toMatchSnapshot()
    })
})
