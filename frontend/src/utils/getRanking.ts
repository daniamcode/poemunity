import { Poem } from '../typescript/interfaces'

interface RankItem {
    author: string
    picture: string
    points: number
}

interface RankAccumulator {
    [userId: string]: RankItem
}

interface SortableObject {
    tempSortName?: string
    [key: string]: any
}

export const SortObjectOfObjects = (data: Record<string, any>, attribute: string): RankItem[] => {
    const array: SortableObject[] = []
    for (const prop in data) {
        if (Object.prototype.hasOwnProperty.call(data, prop)) {
            const object: SortableObject = {
                tempSortName: ''
            }
            object[prop] = data[prop]
            object.tempSortName = data[prop][attribute]
            array.push(object)
        }
    }

    array.sort(function (a: SortableObject, b: SortableObject) {
        const at = a.tempSortName || ''
        const bt = b.tempSortName || ''
        if (at > bt) return -1
        if (at < bt) return 1
        return 0
    })

    const result: RankItem[] = []
    let id = ''
    for (let i = 0, l = array.length; i < l; i++) {
        const object = array[i]
        delete object.tempSortName
        for (const prop in object) {
            if (Object.prototype.hasOwnProperty.call(object, prop)) {
                id = prop
            }
        }
        const item = object[id]
        result.push(item)
    }
    return result
}

export const getRanking = (poems: Poem[], poemPoints: number, likePoints: number): RankItem[] => {
    let rank: RankItem[] = []
    if (poems && poems.length > 0) {
        const rankAccumulator = poems.reduce(function (accumulator: RankAccumulator, item) {
            const points = (accumulator[item.userId]?.points || 0) + poemPoints + likePoints * item.likes.length

            accumulator[item.userId] = {
                author: item.author,
                picture: item.picture,
                points
            }

            return accumulator
        }, {} as RankAccumulator)

        rank = SortObjectOfObjects(rankAccumulator, 'points')
    }

    return rank
}
