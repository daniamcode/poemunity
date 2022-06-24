import axios from 'axios'
import { useQuery } from 'react-query';

export default function usePoems(origin) {
  return useQuery(
    ['poems', origin],
    () => 
      axios.get('/api/poems', origin && origin !== 'all' 
        ? {params: {origin}} 
        : null).then((res) => res.data),
      {
        onError: (error) => {
            console.error(error);
      }
    }
  )
}
// with "fetch" I would have to put this somehow inside the useQuery
// export const loadPoems = async () => {
//     const response = await fetch('/api/poems')
//     if(!response.ok) {
//       throw new Error('Something went wrong')    
//     }
//     return response.json()
//   }
