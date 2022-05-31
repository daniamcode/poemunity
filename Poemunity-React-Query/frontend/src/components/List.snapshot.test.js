import React from 'react'
import renderer from 'react-test-renderer'
import List from './List'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderList (arg) {
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
        <List {...props} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('List', () => {
  let ListTree

  beforeEach(async () => {
    ListTree = renderList()
  })

  it('should match without id', async () => {
    expect(ListTree).toMatchSnapshot()
  })
})
