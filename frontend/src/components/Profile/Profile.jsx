import React, { useState, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AppContext } from '../../App'
import './Profile.scss'
import '../../App.scss'
import { useSelector } from 'react-redux'
import { useProfileForm } from './hooks/useProfileForm'
import ProfileForm from './components/ProfileForm'
import ProfileTabs from './components/ProfileTabs'

export default function Profile() {
    const [value, setValue] = useState(0)
    const context = useContext(AppContext)
    const location = useLocation()
    const poemQuery = useSelector(state => state.poemQuery)
    const poemsListQuery = useSelector(state => state.poemsListQuery)

    const { poem, updatePoemField, handleSend, handleReset } = useProfileForm(context, poemQuery, poemsListQuery, location.state)

    const handleChange = (_event, newValue) => {
        setValue(newValue)
    }

    const handleChangeIndex = index => {
        setValue(index)
    }

    return (
        <main className='profile__main'>
            {context?.user ? (
                <div>
                    <section className='profile__intro'>
                        <img
                            className='profile__image'
                            src='https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg'
                            alt={context?.username}
                        />
                        <ProfileForm
                            context={context}
                            poem={poem}
                            updatePoemField={updatePoemField}
                            poemQuery={poemQuery}
                            handleSend={handleSend}
                            handleReset={handleReset}
                        />
                    </section>
                    <ProfileTabs value={value} handleChange={handleChange} handleChangeIndex={handleChangeIndex} />
                </div>
            ) : null}
        </main>
    )
}
