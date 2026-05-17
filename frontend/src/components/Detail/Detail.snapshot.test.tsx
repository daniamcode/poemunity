import { render } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import Detail from './Detail'
import { Provider } from 'react-redux'
import store from '../../redux/store'

describe('Detail', () => {
    let DetailTree = {}

    beforeEach(async () => {
        mockRouter.setCurrentUrl({ pathname: '/detail/[poemId]', query: { poemId: '1' } })
        DetailTree = render(
            <Provider store={store}>
                <Detail />
            </Provider>
        )
    })

    test('should match without id', async () => {
        expect(DetailTree).toMatchSnapshot()
    })
})
