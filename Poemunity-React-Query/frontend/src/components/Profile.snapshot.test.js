import React from 'react'
import renderer from 'react-test-renderer'
import Profile from './Profile'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderProfile (arg) {
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
        <Profile {...props} />
      </BrowserRouter>
  </QueryClientProvider>
  )
}

describe('Profile', () => {
  let ProfileTree

  beforeEach(async () => {
    ProfileTree = renderProfile()
  })

  it('should match without id', async () => {
    expect(ProfileTree).toMatchSnapshot()
  })
})
