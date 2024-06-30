import checkPropTypes from 'check-prop-types'
import ListItem from './ListItem'
import { manageSuccess, manageError } from '../utils/notifications'
import store from '../redux/store'
import { Provider } from 'react-redux'
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import * as commonActions from '../redux/actions/commonActions'
import { deletePoemAction } from '../redux/actions/poemActions'

// these mocks seem to have to be defined before the "describe"
jest.mock('axios', () => ({
  create: jest.fn(),
  delete: jest.fn()
}))
jest.mock('../utils/notifications', () => ({
  manageSuccess: jest.fn(),
  manageError: jest.fn()
}))
jest.mock('date-fns', () => ({
  format: jest.fn()
}))

describe('ListItem component', () => {
  let wrapper = null
  const wrapperFactory = () => {
    return ({ children }) => (
      <Provider store={store}>
        <Router>{children}</Router>
      </Provider>
    )
  }

  const poem = { id: 1, title: 'test', author: 'test', likes: ['1'] }
  const filter = 'test'
  const context = {
    user: {
      id: 1
    },
    userId: 1,
    adminId: 1,
    setState: jest.fn(),
    config: 'test'
  }

  afterEach(() => {
    // very important, restoreAllMocks works, but clearAllMocks doesn't
    jest.restoreAllMocks()
    wrapper = null
  })

  test('Check PropTypes', () => {
    // we can validate that the test fails just by changing for instance, expectedProps.filter into a number
    const expectedProps = {
      poem: {},
      filter: '',
      context: {}
    }
    const propsErr = checkPropTypes(
      ListItem.propTypes,
      expectedProps,
      'props',
      ListItem.name
    )
    expect(propsErr).toBeUndefined()
  })
  test('Should call manageSuccess when deleting poem', async () => {
    wrapper = wrapperFactory()

    const spy = jest.spyOn(commonActions, 'deleteAction')

    render(<ListItem poem={poem} filter={filter} context={context} />, {
      wrapper
    })

    // this is beacuse we use Axios.create
    axios.create.mockReturnThis()
    axios.delete.mockReturnValueOnce(Promise.resolve({ data: 'poem1' }))
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-poem'))
    })

    expect(spy).toHaveBeenCalled()

    expect(manageSuccess).toHaveBeenCalled()
    expect(manageSuccess).toHaveBeenCalledTimes(1)
    expect(manageSuccess).toHaveBeenCalledWith('Poem deleted')
  })
  test('Should call manageError when failing in deleting poem', async () => {
    wrapper = wrapperFactory()

    const spy = jest.spyOn(commonActions, 'deleteAction')

    render(<ListItem poem={poem} filter={filter} context={context} />, {
      wrapper
    })

    // this is beacuse we use Axios.create
    axios.create.mockReturnThis()
    axios.delete.mockReturnValueOnce(Promise.reject('some error'))

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('delete-poem'))
    })

    expect(spy).toHaveBeenCalled()

    expect(manageError).toHaveBeenCalled()
    expect(manageError).toHaveBeenCalledTimes(2) // review the innecessary call in deleteAction
    expect(manageError).toHaveBeenCalledWith(
      'Sorry. There was an error deleting the poem'
    )
  })
})
