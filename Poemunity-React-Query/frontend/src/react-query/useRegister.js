import axios from 'axios'
import { useHistory } from 'react-router';
import { useMutation, useQueryClient } from 'react-query';
import { manageError } from '../utils/notifications'

export default function useRegister() {
 const queryClient = useQueryClient()
 const baseUrl = '/api/register'
 const history = useHistory()
  return useMutation(
    (data) => {
      return axios.post(baseUrl, data).then((res) => res.data)},
    {
      onSuccess: (data) => {
        // queryClient.invalidateQueries('login')
        history.push('/login')
      },
      onError: (error) => {
        // setErrorMessage('Wrong credentials')
        manageError(error.response.data.error)
        // setTimeout(()=> {
        //   setErrorMessage(null)
        // }, 3000)
      }
    }
  )
}