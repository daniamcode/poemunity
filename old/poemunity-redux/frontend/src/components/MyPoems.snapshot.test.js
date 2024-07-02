import React from 'react'
import { render } from '@testing-library/react'
import MyPoems from './MyPoems'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../redux/store'

function renderMyPoems(arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <MyPoems {...props} />
      </BrowserRouter>
    </Provider>
  )
}

describe('MyPoems', () => {
  let MyPoemsTree

  beforeEach(async () => {
    MyPoemsTree = renderMyPoems()
  })

  test('should match without id', async () => {
    expect(MyPoemsTree).toMatchSnapshot()
  })
})
