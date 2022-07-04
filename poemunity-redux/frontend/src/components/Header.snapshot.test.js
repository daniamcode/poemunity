import React from 'react'
import renderer from 'react-test-renderer'
import Header from './Header'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderHeader (arg) {
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
        <Header {...props} />
      </BrowserRouter>
  </QueryClientProvider>
  )
}

describe('Header', () => {
  let HeaderTree

  beforeEach(async () => {
    HeaderTree = renderHeader()
  })

  test('should match without id', async () => {
    expect(HeaderTree).toMatchSnapshot()
  })
})
