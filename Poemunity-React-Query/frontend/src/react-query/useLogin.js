import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';

export default function useLogin() {
 const queryClient = useQueryClient()
 const baseUrl = '/api/login'
  return useMutation(
    (credentials) => {
      return axios.post(baseUrl, credentials).then((res) => res.data)},
    {
      // onSuccess: (data) => {
      //   queryClient.invalidateQueries('login')
      // },
      onError: (error) => {
        // setErrorMessage('Wrong credentials')
        console.log('something went wrong')
        // setTimeout(()=> {
        //   setErrorMessage(null)
        // }, 3000)
      }
    }
  )
}