import List from './List'
import { render, act, screen, fireEvent } from '@testing-library/react'
import store from '../../redux/store'
import { Provider } from 'react-redux'
import * as Redux from 'react-redux'
import { ORDER_BY_RANDOM } from '../../data/constants'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'

// we cannot mock the whole react-redux; we need the store, so we require everyting except useSelector
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn()
}))
jest.mock('react-helmet')

describe('List', () => {
    // first we need to avoid the DOM with the Spinner
    const mockedState = {
        poemsListQuery: { isFetching: false }
    }
    beforeEach(() => {
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback(mockedState)
        })
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })
    test('Should select order', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const options = screen.getAllByTestId('select-option') as HTMLOptionElement[]

        act(() => {
            // random is the third option
            fireEvent.change(screen.getByTestId('order-select'), {
                target: {
                    value: ORDER_BY_RANDOM
                }
            })
        })

        expect(options[0].selected).toBeFalsy()
        expect(options[1].selected).toBeFalsy()
        expect(options[2].selected).toBeTruthy()
        expect(options[3].selected).toBeFalsy()
    })
    test('Should call Helmet', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )
        expect(Helmet).toHaveBeenCalled()
        expect((Helmet as unknown as jest.Mock).mock.calls[0][0]).toBeTruthy()
    })
})
