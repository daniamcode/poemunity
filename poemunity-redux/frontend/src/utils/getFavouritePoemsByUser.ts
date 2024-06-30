import { Poem } from '../typescript/interfaces'

const getFavouritePoemsByUser = (poems: Poem[], userId: string) => {
  return poems.filter((poem) =>
    poem.likes.some((element) => element === userId)
  )
}

export default getFavouritePoemsByUser
