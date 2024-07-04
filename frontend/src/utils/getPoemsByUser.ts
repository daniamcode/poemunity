import { Poem } from '../typescript/interfaces'

const getPoemsByUser = (poems: Poem[], username: string) => {
    return poems.filter(poem => poem?.author === username)
}

export default getPoemsByUser
