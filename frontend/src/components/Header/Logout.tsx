import React, { useContext } from 'react'
import { AppContext } from '../../App'
import { useRouter } from 'next/router'

const Logout = () => {
    const router = useRouter()
    const context = useContext(AppContext)

    const handleLogout = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault()
        await fetch('/api/auth/logout', { method: 'DELETE' }).catch(() => {})
        context.setState({ ...context, user: '' })
        window.localStorage.removeItem('loggedUser')
        router.push('/')
    }

    return <button className='header__logout' onClick={handleLogout} />
}

export default Logout
