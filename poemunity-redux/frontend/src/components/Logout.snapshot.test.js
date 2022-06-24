import React from 'react'
import renderer from 'react-test-renderer'
import Logout from './Logout'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderLogout (arg) {
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
        <Logout {...props} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Logout', () => {
  let LogoutTree

  beforeEach(async () => {
    LogoutTree = renderLogout()
  })

  it('should match without id', async () => {
    expect(LogoutTree).toMatchSnapshot()
  })
})
