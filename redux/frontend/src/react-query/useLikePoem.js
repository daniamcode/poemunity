import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';

export default function useLikePoem() {
 const queryClient = useQueryClient()
  return useMutation(
    ({poemId, userId}) => axios.put(`/api/poems/${poemId}`, {
      userId}).then((res) => res.data),
    {
      // data is here the whole poem object
      // modifiedPoem is here the id of the poem
      onSuccess: (data, modifiedPoem) => {        
        queryClient.invalidateQueries('poems')
      },
        onError: (error) => {
            console.error(error);
      }
    }
  )
}
