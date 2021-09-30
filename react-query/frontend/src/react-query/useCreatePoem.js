import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';

export default function useCreatePoem() {
 const queryClient = useQueryClient()
  return useMutation(
    (poem) => axios.post('/api/poems', poem).then((res) => res.data),
    {
      onSuccess: () => {        
        queryClient.invalidateQueries('poems')
      },
        onError: (error) => {
            console.error(error);
      }
    }
  )
}
