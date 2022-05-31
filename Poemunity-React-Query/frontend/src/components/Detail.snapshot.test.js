import React from 'react'
import renderer from 'react-test-renderer'
import Detail from './Detail'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderDetail (arg) {
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
        <Detail {...props} />
      </BrowserRouter>
  </QueryClientProvider>
  )
}

describe('Detail', () => {
  let DetailTree

  beforeEach(async () => {
    DetailTree = renderDetail()
  })

  it('should match without id', async () => {
    expect(DetailTree).toMatchSnapshot()
  })
})
