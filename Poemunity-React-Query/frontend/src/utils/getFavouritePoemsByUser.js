const getFavouritePoemsByUser = (poems, userId) => {
    return poems.filter((poem) => poem.likes.some((element) => element === userId))
}

export default getFavouritePoemsByUser