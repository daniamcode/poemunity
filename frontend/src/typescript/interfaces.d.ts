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

export interface User {
    id: string
    username: string
    email: string
    picture: string
    poems: Poem[]
}

export interface StateItem<T> {
    isFetching: boolean
    isError: boolean
    err?: unknown
    // at least we have 2 cases for the item (Poem and Poem[])
    // we could also say that item is "object | object[]"" but we will keep it wider with
    // unknown, and then we can use the "as" operator to cast it to the correct type
    // another option is to use generic T
    item?: T
    abortController?: AbortController
    abortRequests?: boolean
}

export interface ReduxOptions {
    reset?: boolean
    update?: boolean
    fetch?: boolean
    transformResponse?: (response: any) => any
}

export interface ReduxCallbacks {
    success?: (response: any) => void
    error?: (error: any) => void
    reset?: () => void
}

export interface Context {
    elementToEdit: string
    user: string
    userId: string
    username: string
    picture: string
    config: object
    adminId: string
    setState: (state: Context) => void
}
