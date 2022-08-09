import { render } from '@testing-library/react';
import Detail from './Detail'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderDetail(arg?: object) {
  const defaultProps = {
    match: {
      params: {
        poemId: '1',
      }
    }
  }

  const props = { ...defaultProps, ...arg }

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Detail {...props} />
      </BrowserRouter>
    </Provider>
  )
}

describe('Detail', () => {
  let DetailTree = {}

  beforeEach(async () => {
    DetailTree = renderDetail()
  })

  test('should match without id', async () => {
    expect(DetailTree).toMatchSnapshot()
  })
})
