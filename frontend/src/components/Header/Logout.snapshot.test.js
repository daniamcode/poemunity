import { render } from '@testing-library/react'
import Logout from './Logout'
import { Provider } from 'react-redux'
import store from '../../redux/store'

function renderLogout(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
                <Logout {...props} />
        </Provider>
    )
}

describe('Logout', () => {
    let LogoutTree

    beforeEach(async () => {
        LogoutTree = renderLogout()
    })

    test('should match without id', async () => {
        expect(LogoutTree).toMatchSnapshot()
    })
})
