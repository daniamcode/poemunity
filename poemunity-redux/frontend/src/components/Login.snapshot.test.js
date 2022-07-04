import React from 'react'
import renderer from 'react-test-renderer'
import Login from './Login'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderLogin (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }
  const queryClient = new QueryClient();

  return renderer.create(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Login {...props} />
      </BrowserRouter>
    </QueryClientProvider>
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
