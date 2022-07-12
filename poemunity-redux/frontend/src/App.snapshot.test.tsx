import { render } from '@testing-library/react';
import App from './App'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { Provider } from 'react-redux';
import store from './redux/store';


describe('App snapshot', () => {
  const queryClient = new QueryClient();

  const tree = render(
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    </Provider>
  )

  test('should match', () => {
    expect(tree.asFragment()).toMatchSnapshot()
  })
})
