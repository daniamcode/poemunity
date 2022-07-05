import React from 'react'
import renderer from 'react-test-renderer'
import MyFavouritePoems from './MyFavouritePoems'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderMyFavouritePoems (arg) {
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
        <MyFavouritePoems {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
  )
}

describe('MyFavouritePoems', () => {
  let MyFavouritePoemsTree

  beforeEach(async () => {
    MyFavouritePoemsTree = renderMyFavouritePoems()
  })

  test('should match without id', async () => {
    expect(MyFavouritePoemsTree).toMatchSnapshot()
  })
})
