import React from 'react'
import renderer from 'react-test-renderer'
import List from './List'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import store from '../redux/store';
import { Provider } from 'react-redux';

function renderList (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }
  const queryClient = new QueryClient();

  return renderer.create(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <List {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
  )
}

describe('List', () => {
  let ListTree

  beforeEach(async () => {
    ListTree = renderList()
  })

  test('should match without id', async () => {
    expect(ListTree).toMatchSnapshot()
  })
})
