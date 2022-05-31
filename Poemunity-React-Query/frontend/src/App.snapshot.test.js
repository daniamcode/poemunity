import renderer from 'react-test-renderer'
import React from 'react'
import App from './App'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

describe('App snapshot', () => {
  const queryClient = new QueryClient();

  const tree = renderer.create(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )

  it('should match', () => {
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
