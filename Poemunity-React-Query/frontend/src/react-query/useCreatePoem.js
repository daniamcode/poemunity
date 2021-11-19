import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';
import { useContext } from 'react';
import { AppContext } from '../App';

export default function useCreatePoem() {
 const queryClient = useQueryClient()
 const context = useContext(AppContext);
 return useMutation(
   (poem) => {
     console.log(poem)
      axios.post('/api/poems', poem, context.config).then((res) => res.data)},
    {
      onSuccess: () => {        
        queryClient.invalidateQueries('poems')
        queryClient.cancelQueries('poems')
        queryClient.refetchQueries('poems')
      },
        onError: (error) => {
            console.error(error);
      }
    }
  )
}
