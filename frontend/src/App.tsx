import React, { useState, useEffect } from 'react'
import { Context } from './typescript/interfaces'
import { useAppDispatch } from './redux/store'
import store from './redux/store'
import { getRankingAction } from './redux/actions/poemsActions'
import type { ServerUser } from './lib/serverApi'

export const AppContext = React.createContext<Context>({
    elementToEdit: '',
    user: '',
    userId: '',
    username: '',
    picture: '',
    bio: '',
    preferredGenres: [],
    config: {},
    isAdmin: false,
    setState: () => {}
})

interface AppProviderProps {
    children: React.ReactNode
    initialUser?: ServerUser | null
}

function getAuthState(user?: ServerUser | null): Omit<Context, 'elementToEdit' | 'setState'> {
    return {
        user: user?.user ?? '',
        userId: user?.userId ?? '',
        username: user?.username ?? '',
        picture: user?.picture ?? '',
        bio: user?.bio ?? '',
        preferredGenres: user?.preferredGenres ?? [],
        name: user?.name ?? '',
        surname: user?.surname ?? '',
        city: user?.city ?? '',
        country: user?.country ?? '',
        birthYear: user?.birthYear ?? null,
        gender: user?.gender ?? '',
        privateFields: user?.privateFields ?? [],
        config: user?.config ?? { withCredentials: true },
        isAdmin: user?.isAdmin ?? false
    }
}

export function AppProvider({ children, initialUser }: AppProviderProps) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const rankingState = store.getState().rankingQuery
        if (!rankingState.item && !rankingState.isFetching) {
            dispatch(getRankingAction({ params: { origin: 'user' } }))
        }
    }, [dispatch])

    const [contextState, setContextState] = useState<Context>({
        elementToEdit: '',
        ...getAuthState(initialUser),
        setState(data: Context) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, unused-imports/no-unused-vars
            const { setState: _setState, ...res } = data
            setContextState(prevState => ({
                ...prevState,
                ...res
            }))
        }
    })

    useEffect(() => {
        if (initialUser !== undefined) {
            setContextState(prevState => ({
                ...prevState,
                ...getAuthState(initialUser)
            }))
            return
        }

        if (typeof fetch !== 'function') return

        let cancelled = false
        fetch('/api/auth/session')
            .then(res => res.ok && res.status !== 204 ? res.json() : null)
            .then(user => {
                if (!cancelled && user) {
                    setContextState(prevState => ({
                        ...prevState,
                        ...getAuthState(user)
                    }))
                }
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [initialUser])

    return (
        <AppContext.Provider value={contextState}>
            {children}
        </AppContext.Provider>
    )
}
