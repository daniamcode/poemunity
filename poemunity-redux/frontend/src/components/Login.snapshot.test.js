import React from 'react'
import { render } from '@testing-library/react';
import Login from './Login'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderLogin (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }
  const queryClient = new QueryClient();

  return render(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Login {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
  )
}

describe('Login', () => {
  let LoginTree

  beforeEach(async () => {
    LoginTree = renderLogin()
  })

  test('should match without id', async () => {
    expect(LoginTree).toMatchSnapshot()
  })
})
