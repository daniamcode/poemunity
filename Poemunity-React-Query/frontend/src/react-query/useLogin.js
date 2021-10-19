import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router';

export default function useLogin() {
 const queryClient = useQueryClient()
 const baseUrl = '/api/login'
 const history = useHistory()
  return useMutation(
    (credentials) => {
      return axios.post(baseUrl, credentials).then((res) => res.data)},
    {
      onSuccess: (data) => {
        // queryClient.invalidateQueries('login')
        window.localStorage.setItem(
          'loggedUser', JSON.stringify(data)
        )
        history.push('profile')
      },
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