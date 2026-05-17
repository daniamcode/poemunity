import React, { useState, useEffect } from 'react'
import { Context } from './typescript/interfaces'
import { useAppDispatch } from './redux/store'
import store from './redux/store'
import { getRankingAction } from './redux/actions/poemsActions'

export const AppContext = React.createContext<Context>({
    elementToEdit: '',
    user: '',
    userId: '',
    username: '',
    picture: '',
    bio: '',
    preferredGenres: [],
    config: {},
    adminId: '',
    setState: () => {}
})

interface AppProviderProps {
    children: React.ReactNode
    initialUser?: import('./lib/serverApi').ServerUser | null
}

export function AppProvider({ children, initialUser }: AppProviderProps) {
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!store.getState().rankingQuery.item) {
            dispatch(getRankingAction({ params: { origin: 'user' } }))
        }
    }, [dispatch])

    const [contextState, setContextState] = useState({
        elementToEdit: '',
        user: initialUser?.user ?? '',
        userId: initialUser?.userId ?? '',
        username: initialUser?.username ?? '',
        picture: initialUser?.picture ?? '',
        bio: '',
        preferredGenres: [] as string[],
        name: '',
        surname: '',
        city: '',
        country: '',
        birthYear: null as number | null,
        gender: '',
        privateFields: [] as string[],
        config: initialUser?.config ?? {},
        adminId: process.env.NEXT_PUBLIC_ADMIN ?? '',
        setState(data: Context) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, unused-imports/no-unused-vars
            const { setState: _setState, ...res } = data
            setContextState(prevState => ({
                ...prevState,
                ...res
            }))
        }
    })

    return (
        <AppContext.Provider value={contextState}>
            {children}
        </AppContext.Provider>
    )
}
