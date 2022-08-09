import React from 'react'
import { render } from '@testing-library/react';
import PageNotFound from './PageNotFound'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderPageNotFound (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <PageNotFound {...props} />
      </BrowserRouter>
    </Provider>
  )
}

describe('PageNotFound', () => {
  let PageNotFoundTree

  beforeEach(async () => {
    PageNotFoundTree = renderPageNotFound()
  })

  test('should match without id', async () => {
    expect(PageNotFoundTree).toMatchSnapshot()
  })
})
