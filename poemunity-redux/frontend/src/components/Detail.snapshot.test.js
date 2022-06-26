import React from 'react'
import renderer from 'react-test-renderer'
import Detail from './Detail'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import configureStore from '../redux/store';


function renderDetail (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }
  const queryClient = new QueryClient();
  const store = configureStore();

  return renderer.create(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Detail {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
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
