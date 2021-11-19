import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';
import { useContext } from 'react';
import { AppContext } from '../App';

export default function useSavePoem() {
 const queryClient = useQueryClient()
 const context = useContext(AppContext);

  return useMutation(
    // arguments have to be a single variable or object in this case
    ({poem, poemId}) => axios.patch(`/api/poems/${poemId}`, poem, context.config).then((res) => res.data),
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
