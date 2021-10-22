const getPoemsByUser = (poems, username) => {
    return poems.filter((poem) => poem?.author === username)
}

export default getPoemsByUser