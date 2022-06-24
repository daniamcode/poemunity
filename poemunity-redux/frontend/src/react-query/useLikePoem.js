import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';
import { useContext } from 'react';
import { AppContext } from '../App';

export default function useLikePoem() {
 const queryClient = useQueryClient()
 const context = useContext(AppContext);
  return useMutation(
    // arguments have to be a single variable or object in this case
    (poemId) => axios.put(`/api/poems/${poemId}`, null, 
        context.config).then((res) => res.data),
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
