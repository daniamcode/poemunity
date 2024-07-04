import React from 'react'
import { render } from '@testing-library/react'
import Ranking from './Ranking'
import { BrowserRouter } from 'react-router-dom'
import store from '../redux/store'
import { Provider } from 'react-redux'

function renderRanking(arg) {
    const defaultProps = {
        match: {
            params: {}
        }
    }

    const props = { ...defaultProps, ...arg }

    return render(
        <Provider store={store}>
            <BrowserRouter>
                <Ranking {...props} />
            </BrowserRouter>
        </Provider>
    )
}

describe('Ranking', () => {
    let RankingTree

    beforeEach(async() => {
        RankingTree = renderRanking()
    })

    test('should match without id', async() => {
        expect(RankingTree).toMatchSnapshot()
    })
})
