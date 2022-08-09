import React from 'react'
import { render } from '@testing-library/react';
import MyFavouritePoems from './MyFavouritePoems'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from '../redux/store';


function renderMyFavouritePoems (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <MyFavouritePoems {...props} />
      </BrowserRouter>
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
