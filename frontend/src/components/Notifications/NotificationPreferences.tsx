import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppContext } from '../../App'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import {
    getNotificationPreferencesAction,
    saveNotificationPreferencesAction
} from '../../redux/actions/notificationsActions'
import { NotificationPreferences as Prefs } from '../../redux/reducers/notificationsReducers'
import {
    NOTIFICATION_PREFS_TITLE,
    NOTIFICATION_PREFS_INTRO,
    NOTIFICATION_PREF_LABELS
} from '../../data/constants'

const TYPES: (keyof Prefs)[] = ['like', 'comment', 'follow', 'newPoem']

/**
 * The four toggles.
 *
 * Defaults to every box CHECKED while the request is in flight, not unchecked.
 * The server's rule is that an absent preference means on, so an unchecked
 * initial render would tell a user their notifications are off and then flip —
 * and anyone who toggled during that window would be acting on a false picture.
 */
export default function NotificationPreferences() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()
    const query = useSelector((state: RootState) => state.notificationPreferencesQuery)
    const prefs = query?.item as Prefs | undefined

    useEffect(() => {
        if (context?.user) {
            dispatch(getNotificationPreferencesAction({}))
        }
    }, [context?.user, dispatch])

    if (!context?.user) return null

    const isOn = (type: keyof Prefs) => prefs?.[type] !== false

    const handleToggle = (type: keyof Prefs) => {
        // Sends only the field that changed. A full-object PATCH would race two
        // quick toggles and write back a stale value for the other three.
        dispatch(saveNotificationPreferencesAction({ data: { [type]: !isOn(type) } }))
    }

    return (
        <section className='notification-prefs'>
            <h2 className='notification-prefs__title'>{NOTIFICATION_PREFS_TITLE}</h2>
            <p className='notification-prefs__intro'>{NOTIFICATION_PREFS_INTRO}</p>
            <ul className='notification-prefs__list'>
                {TYPES.map(type => (
                    <li key={type} className='notification-prefs__item'>
                        <label className='notification-prefs__label'>
                            <input
                                type='checkbox'
                                checked={isOn(type)}
                                onChange={() => handleToggle(type)}
                                disabled={query?.isFetching}
                            />
                            <span>{NOTIFICATION_PREF_LABELS[type]}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </section>
    )
}
