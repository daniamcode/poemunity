import { render } from '@testing-library/react'
import Header from './Header'
import { Provider } from 'react-redux'
import store from '../../redux/store'

function renderHeader(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
                <Header {...props} />
        </Provider>
    )
}

describe('Header', () => {
    let HeaderTree

    beforeEach(async () => {
        HeaderTree = renderHeader()
    })

    test('should match without id', async () => {
        expect(HeaderTree).toMatchSnapshot()
    })
})
