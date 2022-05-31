import React from 'react'
import renderer from 'react-test-renderer'
import Ranking from './Ranking'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

function renderRanking (arg) {
  const defaultProps = {
    match: {
      params: {}
    }
  }

  const props = { ...defaultProps, ...arg }
  const queryClient = new QueryClient();

  return renderer.create(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Ranking {...props} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Ranking', () => {
  let RankingTree

  beforeEach(async () => {
    RankingTree = renderRanking()
  })

  it('should match without id', async () => {
    expect(RankingTree).toMatchSnapshot()
  })
})
