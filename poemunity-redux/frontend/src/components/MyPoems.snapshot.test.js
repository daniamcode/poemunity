import React from 'react'
import renderer from 'react-test-renderer'
import MyPoems from './MyPoems'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import configureStore from '../redux/store';


function renderMyPoems (arg) {
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
        <MyPoems {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
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
