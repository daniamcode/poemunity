const getPoemsByUser = (poems, user) => {
    return poems.filter((poem) => poem?.author === user?.name)
}

export default getPoemsByUser