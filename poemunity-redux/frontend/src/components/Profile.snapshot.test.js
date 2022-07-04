import React from 'react'
import renderer from 'react-test-renderer'
import Profile from './Profile'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import configureStore from '../redux/store';


function renderProfile (arg) {
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
        <Profile {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
  )
}

describe('Profile', () => {
  let ProfileTree

  beforeEach(async () => {
    ProfileTree = renderProfile()
  })

  test('should match without id', async () => {
    expect(ProfileTree).toMatchSnapshot()
  })
})
