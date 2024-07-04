import {
    ORDER_BY_DATE,
    ORDER_BY_LIKES,
    ORDER_BY_RANDOM,
    ORDER_BY_TITLE
} from '../data/constants'

function sortPoems(sort, poems) {
    if (sort === ORDER_BY_TITLE) {
        poems.sort(function(a, b) {
            if (a.title.toLowerCase() < b.title.toLowerCase()) {
                return -1
            }
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
                return 1
            }
            return 0
        })
    }
    if (sort === ORDER_BY_LIKES) {
        poems.sort(function(a, b) {
            return b.likes.length - a.likes.length
        })
    }
    if (sort === ORDER_BY_RANDOM) {
        poems.sort(() => Math.random() - 0.5)
    }
    if (sort === ORDER_BY_DATE) {
        poems.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date)
        })
    }
    return poems
}

export default sortPoems
