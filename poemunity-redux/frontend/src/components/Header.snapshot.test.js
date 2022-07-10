import React from 'react'
import renderer from 'react-test-renderer'
import Header from './Header'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderHeader (arg) {
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
        <Header {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
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
