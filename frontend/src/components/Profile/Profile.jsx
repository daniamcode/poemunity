import React, { useState, useContext } from 'react'
import { AppContext } from '../../App'
import { useSelector } from 'react-redux'
import { useProfileForm } from './hooks/useProfileForm'
import { selectPoemsListPoems } from '../../redux/selectors/poemCacheSelectors'
import ProfileForm from './components/ProfileForm'
import ProfilePicture from './components/ProfilePicture'
import ProfileTabs from './components/ProfileTabs'
import NotificationPreferences from '../Notifications/NotificationPreferences'
import ProfileStats from './ProfileStats'
import UserInfo from './components/UserInfo'

export default function Profile() {
    const [value, setValue] = useState(0)
    const context = useContext(AppContext)
    const poemQuery = useSelector(state => state.poemQuery)
    const poemsListQueryRaw = useSelector(state => state.poemsListQuery)
    // The cache stores poem ids; the form's edit-prefill logic expects full poems
    // in `item`, so resolve them through the entity store (memoized selector).
    const poemsListPoems = useSelector(selectPoemsListPoems)
    const poemsListQuery = { ...poemsListQueryRaw, item: poemsListPoems }

    const { poem, isEditing, updatePoemField, handleSend, handleSaveDraft, handleReset, handleCancel } = useProfileForm(
        context,
        poemQuery,
        poemsListQuery
    )

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
                    <section className='profile__intro-wrapper'>
                        <div className='profile__intro'>
                            <div className='profile__user-column'>
                                <ProfilePicture context={context} />
                                <UserInfo context={context} />
                                <ProfileStats />
                            </div>
                            <ProfileForm
                                context={context}
                                poem={poem}
                                isEditing={isEditing}
                                updatePoemField={updatePoemField}
                                poemQuery={poemQuery}
                                handleSend={handleSend}
                                handleSaveDraft={handleSaveDraft}
                                handleReset={handleReset}
                                handleCancel={handleCancel}
                            />
                        </div>
                    </section>
                    <ProfileTabs value={value} handleChange={handleChange} handleChangeIndex={handleChangeIndex} />
                    {/* BELOW the tabs, not in the settings column beside the
                        form.
                        
                        Six toggles plus the email section made that column
                        roughly twice the height of the poem form next to it —
                        a long band of dead space down the right of the page —
                        and worse, it pushed the TABS below the fold. The tabs
                        are the profile: your poems, drafts, follows, comments.
                        Settings you change once a year should not outrank
                        them, and a reader had no reason to expect anything
                        below that column at all.
                        
                        Still not behind a tab of its own: the bell's panel is
                        already the notifications surface, and a tab showing
                        the same list would add a tab without adding a
                        capability. */}
                    <NotificationPreferences />
                </div>
            ) : null}
        </main>
    )
}
