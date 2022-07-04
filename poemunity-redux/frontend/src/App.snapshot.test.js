import renderer from 'react-test-renderer'
import React from 'react'
import App from './App'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import configureStore from './redux/store';

const store = configureStore();

describe('App snapshot', () => {
  const queryClient = new QueryClient();

  const tree = renderer.create(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    </Provider>
  )

  test('should match', () => {
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
