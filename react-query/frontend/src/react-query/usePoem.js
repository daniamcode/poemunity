import axios from 'axios'
import { useQuery, useQueryClient } from 'react-query';

export default function usePoem(_id) {
 const queryClient = useQueryClient()
  return useQuery(
    ['poems', _id],
    () => axios.get(`/api/poems/${_id}`).then((res) => res.data),
    {
      initialData: () => { 
        return queryClient.getQueryData('poems')?.find(d => d.id == _id)
      },
      initialStale: true,
      onError: (error) => {
          console.error(error);
      }
    }
  )
}
