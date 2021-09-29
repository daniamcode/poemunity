import axios from 'axios'
import { useQuery } from 'react-query';

export default function usePoem(_id) {
  return useQuery(
    ['poems', _id],
    () => axios.get(`/api/poems/${_id}`).then((res) => res.data),
    {
        onError: (error) => {
            console.error(error);
      }
    }
  )
}
