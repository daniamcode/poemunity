import { render } from '@testing-library/react';
import App from './App'
import { Provider } from 'react-redux';
import store from './redux/store';


describe('App snapshot', () => {
  const tree = render(
    <Provider store={store}>
      <App />
    </Provider>
  )

  test('should match', () => {
    expect(tree.asFragment()).toMatchSnapshot()
  })
})
