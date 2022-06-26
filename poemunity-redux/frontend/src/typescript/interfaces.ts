export interface Poem {
    id: string,
    author: string,
    date: string,
    genre: string,
    likes: string[],
    picture: string,
    poem: string,
    title: string,
    userId: string,
  }

export interface PoemQuery {
    isFetching: boolean,
    isError: boolean,
    item: Poem,
  }

export interface IRootState {
    poemQuery: PoemQuery
  }

export interface Props {
    match: {params: {poemId: string}}
  }