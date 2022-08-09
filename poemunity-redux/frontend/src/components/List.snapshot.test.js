import React from 'react'
import { render } from '@testing-library/react';
import List from './List'
import { BrowserRouter } from 'react-router-dom'
import store from '../redux/store';
import { Provider } from 'react-redux';

function renderList (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <List {...props} />
      </BrowserRouter>
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
