import React from 'react'
import renderer from 'react-test-renderer'
import Logout from './Logout'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderLogout (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }
  const queryClient = new QueryClient();

  return renderer.create(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Logout {...props} />
      </BrowserRouter>
    </QueryClientProvider>
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
