import { render } from '@testing-library/react'
import MyFavouritePoems from './MyFavouritePoems'
import { Provider } from 'react-redux'
import store from '../../redux/store'

function renderMyFavouritePoems(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
                <MyFavouritePoems {...props} />
        </Provider>
    )
}

describe('MyFavouritePoems', () => {
    let MyFavouritePoemsTree

    beforeEach(async () => {
        MyFavouritePoemsTree = renderMyFavouritePoems()
    })

    test('should match without id', async () => {
        expect(MyFavouritePoemsTree).toMatchSnapshot()
    })
})
