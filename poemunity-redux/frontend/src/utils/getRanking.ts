import { Poem } from '../typescript/interfaces';


export const SortObjectOfObjects = (data: object, attribute: string) => {
    const array = []
    for (const prop in data) {
      if (data.hasOwnProperty(prop)) {
        const object: {tempSortName?: string} = { tempSortName: '' }
        object[prop] = data[prop]
        object.tempSortName = data[prop][attribute]
        array.push(object)
      }
    }

    array.sort(function (a: any, b: any) {
      const at = a.tempSortName
      const bt = b.tempSortName
      return at > bt ? -1 : (at < bt ? 1 : 0)
    })

    const result = []
    let id = ''
    for (let i = 0, l = array.length; i < l; i++) {
      const object = array[i]
      delete object.tempSortName
      for (const prop in object) {
        if (object.hasOwnProperty(prop)) {
          id = prop
        }
      }
      const item = object[id]
      result.push(item)
    }
    return result
}

export const getRanking = (poems: Poem[], poemPoints: number, likePoints: number): object => {
    let rank = {}
    if(poems && poems.length > 0) {
      rank = poems.reduce(function (accumulator, item) {
          const points = (accumulator[item.userId]?.points || 0) + poemPoints + (likePoints * item.likes.length)
  
          accumulator[item.userId] = {
          author: item.author,
          picture: item.picture,
          points
          }
  
          return accumulator
      }, {})
  
      rank = SortObjectOfObjects(rank, 'points')
    }

return rank
}