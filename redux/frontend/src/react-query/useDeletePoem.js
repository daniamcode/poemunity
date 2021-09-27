import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';

export default function useDeletePoem() {
 const queryClient = useQueryClient()
  return useMutation(
    (_id) => axios.delete(`/api/poems/${_id}`).then((res) => res.data),
    {
      onSuccess: (data, poemDeleted) => {
        // const oldPoems = queryClient.getQueryData('poems')
  

        // if (oldPoems) {
        //   return () => {
        //       queryClient.setQueryData('poems', oldPoems.filter((poem) => poem !== poemDeleted))
        //       debugger
        //     }
        // }
        // debugger
        // return () => queryClient.setQueryData('poems', oldPoems)
        // queryClient.setQueryData('poems', old=>old.filter((poem) => poem !== poemDeleted))
        // debugger
        queryClient.invalidateQueries('poems')
      },
        // onSuccess: () => queryCache.refetchQueries('poems'),
        onError: (error) => {
            console.error(error);
      }
    }
  )
}