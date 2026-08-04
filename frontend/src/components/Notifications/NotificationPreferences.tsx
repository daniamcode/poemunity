import { useContext, useEffect, useRef, useState } from 'react'
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
    NOTIFICATION_PREF_LABELS,
    EMAIL_PREFS_TITLE,
    EMAIL_PREFS_INTRO,
    EMAIL_PREFS_SOON_BADGE,
    EMAIL_PREFS_SOON_HINT,
    EMAIL_DIGEST_LABEL
} from '../../data/constants'

const TYPES: (keyof Prefs)[] = ['like', 'comment', 'profileComment', 'reply', 'follow', 'newPoem']

/**
 * The four toggles.
 *
 * Defaults to every box CHECKED while the initial request is in flight, not
 * unchecked. The server's rule is that an absent preference means on, so an
 * unchecked initial render would tell a user their notifications are off and
 * then flip — and anyone who toggled during that window would be acting on a
 * false picture. They are also DISABLED until that request lands, for the same
 * reason: you should not be able to toggle a value you have not been shown yet.
 *
 * THE BOXES ARE INDEPENDENT. They did not used to be: every input carried
 * `disabled={query.isFetching}`, and `isFetching` is one flag for the whole
 * query — so toggling "Likes" greyed out and restored all four, which is
 * exactly what it looked like. Saving now disables nothing, and the box flips
 * IMMEDIATELY from local state rather than waiting for the round-trip. On a
 * cold serverless backend that wait was long enough to read as a dead control.
 */
export default function NotificationPreferences() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()
    const query = useSelector((state: RootState) => state.notificationPreferencesQuery)
    const prefs = query?.item as Prefs | undefined

    // Optimistic overrides, per type. A key lives here only between the click
    // and its own response.
    const [pending, setPending] = useState<Partial<Record<keyof Prefs, boolean>>>({})

    // One ticket counter per type, so a response can tell whether it is the
    // LATEST word on that box. Toggle twice quickly and the first response must
    // not clear an override the second one is still relying on — that would
    // snap the box back to the older server value mid-flight.
    const tickets = useRef<Partial<Record<keyof Prefs, number>>>({})

    useEffect(() => {
        if (context?.user) {
            dispatch(getNotificationPreferencesAction({}))
        }
    }, [context?.user, dispatch])

    if (!context?.user) return null

    const isOn = (type: keyof Prefs) => pending[type] ?? prefs?.[type] !== false

    const settle = (type: keyof Prefs, ticket: number) => {
        if (tickets.current[type] !== ticket) return
        setPending(previous => {
            const rest = { ...previous }
            delete rest[type]
            return rest
        })
    }

    const handleToggle = (type: keyof Prefs) => {
        const next = !isOn(type)
        const ticket = (tickets.current[type] ?? 0) + 1
        tickets.current[type] = ticket

        setPending(previous => ({ ...previous, [type]: next }))

        // Sends only the field that changed. A full-object PATCH would race two
        // quick toggles and write back a stale value for the other three.
        dispatch(saveNotificationPreferencesAction({
            data: { [type]: next },
            callbacks: {
                // Clearing the override reveals the server's value, which now
                // agrees with it.
                success: () => settle(type, ticket),
                // And on failure it reveals the value that is actually stored,
                // which un-flips the box. A toggle that silently did nothing
                // while still looking set is the worst outcome here.
                error: () => settle(type, ticket)
            }
        }))
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
                                // Only until the initial values have arrived —
                                // never while saving. See the note above.
                                disabled={!prefs}
                            />
                            <span>{NOTIFICATION_PREF_LABELS[type]}</span>
                        </label>
                    </li>
                ))}
            </ul>

            {/*
                EMAIL, ANNOUNCED BUT NOT BUILT.

                Shown rather than omitted because the absence of email should be
                a stated fact, not something a poet has to infer from four
                toggles that never mention it. Resend is wired up
                (`backend/src/utils/email.js`) and already sends password resets
                and verification, so "we cannot send mail" is not the blocker —
                a SCHEDULER is, plus an unsubscribe route. See TODO.md.

                Three things make this honest rather than a tease:
                  * it is `disabled` and permanently unchecked, so it cannot be
                    mistaken for a subscription you already have;
                  * it sends nothing and is bound to no state — there is no
                    field behind it on `Author`, and inventing one now would
                    persist a preference the sender does not read;
                  * "coming soon" lives in the ACCESSIBLE NAME, not only in the
                    badge. A disabled input is skipped by keyboard navigation
                    and a purely visual badge beside it would never be read out,
                    so a screen-reader user would meet an unexplained dead
                    control.
            */}
            <div className='notification-prefs__email'>
                <h3 className='notification-prefs__subtitle'>
                    {EMAIL_PREFS_TITLE}
                    <span className='notification-prefs__badge'>{EMAIL_PREFS_SOON_BADGE}</span>
                </h3>
                <p className='notification-prefs__intro'>{EMAIL_PREFS_INTRO}</p>
                <ul className='notification-prefs__list'>
                    <li className='notification-prefs__item'>
                        <label className='notification-prefs__label notification-prefs__label--disabled'>
                            <input
                                type='checkbox'
                                checked={false}
                                disabled
                                readOnly
                                aria-label={`${EMAIL_DIGEST_LABEL} (${EMAIL_PREFS_SOON_HINT})`}
                            />
                            <span>{EMAIL_DIGEST_LABEL}</span>
                        </label>
                    </li>
                </ul>
            </div>
        </section>
    )
}
