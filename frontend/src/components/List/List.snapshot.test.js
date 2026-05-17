import { render } from '@testing-library/react'
import List from './List'
import store from '../../redux/store'
import { Provider } from 'react-redux'

function renderList(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
                <List {...props} />
        </Provider>
    )
}

describe('List', () => {
    let ListTree

    beforeEach(async () => {
        ListTree = renderList()
    })

    test('should match without id', async () => {
        expect(ListTree).toMatchSnapshot()
    })
})
