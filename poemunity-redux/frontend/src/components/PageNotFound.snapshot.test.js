import React from 'react'
import renderer from 'react-test-renderer'
import PageNotFound from './PageNotFound'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderPageNotFound (arg) {
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
        <PageNotFound {...props} />
      </BrowserRouter>
  </QueryClientProvider>
  )
}

describe('PageNotFound', () => {
  let PageNotFoundTree

  beforeEach(async () => {
    PageNotFoundTree = renderPageNotFound()
  })

  test('should match without id', async () => {
    expect(PageNotFoundTree).toMatchSnapshot()
  })
})
