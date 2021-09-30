const getFavouritePoemsByUser = (poems, user) => {
    return poems.filter((poem) => poem.likes.some((element) => element === user.sub))
}

export default getFavouritePoemsByUser