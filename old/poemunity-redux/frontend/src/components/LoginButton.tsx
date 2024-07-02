import { useHistory } from 'react-router'
import './Header.scss'

const LoginButton = () => {
  const history = useHistory()
  return (
    <button className='header__login' onClick={() => history.push('/login')} />
  )
}

export default LoginButton
