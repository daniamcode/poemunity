import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';

export default function useCreatePoem() {
 const queryClient = useQueryClient()
 return useMutation(
   ({poem, token}) => {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      axios.post('/api/poems', poem, config).then((res) => res.data)},
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
