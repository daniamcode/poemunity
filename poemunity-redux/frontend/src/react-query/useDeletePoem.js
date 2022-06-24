import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';
import { useContext } from 'react';
import { AppContext } from '../App';

export default function useDeletePoem() {
 const queryClient = useQueryClient()
 const context = useContext(AppContext);
  return useMutation(
    (id) => axios.delete(`/api/poems/${id}`, context.config).then((res) => res.data),
    {
      onSuccess: (data, poemDeleted) => {
        // const oldPoems = queryClient.getQueryData('poems')
  

        // if (oldPoems) {
        //   return () => {
        //       queryClient.setQueryData('poems', oldPoems.filter((poem) => poem !== poemDeleted))
        //       debugger
        //     }
        // }
        // return () => queryClient.setQueryData('poems', oldPoems)
        // queryClient.setQueryData('poems', old=>old.filter((poem) => poem !== poemDeleted))
        // queryClient.invalidateQueries('poems', { exact: true })
        queryClient.invalidateQueries(['poems'])
        queryClient.invalidateQueries(['poems', 'all'])
        // queryClient.invalidateQueries(['poems', 'user'])
        // queryClient.invalidateQueries(['poems', 'famous'])
      },
        // onSuccess: () => queryCache.refetchQueries('poems'),
        onError: (error) => {
            console.error(error);
      }
    }
  )
}