import axios from 'axios'
import { useQuery, useQueryClient } from 'react-query';

export default function usePoem(id) {
 const queryClient = useQueryClient()
  return useQuery(
    ['poems', id],
    () => axios.get(`/api/poems/${id}`).then((res) => res.data),
    {
      initialData: () => { 
        return queryClient.getQueryData('poems')?.find(d => d.id === id)
      },
      initialStale: true,
      onError: (error) => {
          console.error(error);
      }
    }
  )
}
