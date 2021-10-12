import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';

export default function useSavePoem() {
 const queryClient = useQueryClient()
  return useMutation(
    // arguments have to be a single variable or object in this case
    ({poem, poemId}) => axios.patch(`/api/poems/${poemId}`, poem).then((res) => res.data),
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
