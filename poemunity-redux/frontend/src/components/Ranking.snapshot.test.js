import React from 'react'
import renderer from 'react-test-renderer'
import Ranking from './Ranking'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"
import configureStore from '../redux/store';
import { Provider } from 'react-redux';

function renderRanking (arg) {
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
        <Ranking {...props} />
      </BrowserRouter>
    </QueryClientProvider>
    </Provider>
  )
}

describe('Ranking', () => {
  let RankingTree

  beforeEach(async () => {
    RankingTree = renderRanking()
  })

  test('should match without id', async () => {
    expect(RankingTree).toMatchSnapshot()
  })
})
