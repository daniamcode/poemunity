export interface Poem {
  id: string
  author: string
  date: string
  genre: string
  likes: string[]
  picture: string
  poem: string
  title: string
  userId: string
}

export interface PoemQuery {
  isFetching: boolean
  isError: boolean
  item?: Poem
}

export interface PoemsListQuery {
  isFetching: boolean
  isError: boolean
  item?: Poem[]
}

export interface RootState {
  poemQuery: PoemQuery
  poemsListQuery: PoemsListQuery
}

export interface Context {
  elementToEdit: string
  user: string
  userId: string
  username: string
  picture: string
  config: {},
  adminId: string
  setState: (state: Context) => void
}

export interface ReduxOptions {
  reset: boolean
  update: boolean
  fetch: boolean
  transformResponse?: (response: any) => any
}

export interface ReduxCallbacks {
  success?: (response: any) => void
  error?: (error: any) => void
  reset?: () => void
}