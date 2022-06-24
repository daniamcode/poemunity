import React from 'react'
import renderer from 'react-test-renderer'
import MyPoems from './MyPoems'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderMyPoems (arg) {
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
        <MyPoems {...props} />
      </BrowserRouter>
  </QueryClientProvider>
  )
}

describe('MyPoems', () => {
  let MyPoemsTree

  beforeEach(async () => {
    MyPoemsTree = renderMyPoems()
  })

  it('should match without id', async () => {
    expect(MyPoemsTree).toMatchSnapshot()
  })
})
