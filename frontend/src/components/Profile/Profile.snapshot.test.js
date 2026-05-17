import { render } from '@testing-library/react'
import Profile from './Profile'
import { Provider } from 'react-redux'
import store from '../../redux/store'

function renderProfile(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
                <Profile {...props} />
        </Provider>
    )
}

describe('Profile', () => {
    let ProfileTree

    beforeEach(async () => {
        ProfileTree = renderProfile()
    })

    test('should match without id', async () => {
        expect(ProfileTree).toMatchSnapshot()
    })
})
