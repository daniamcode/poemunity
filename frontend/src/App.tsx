import React, { useState, useEffect, Suspense } from 'react'
import { Route, Switch, BrowserRouter as Router, Redirect, RouteProps } from 'react-router-dom'
import './App.scss'
import Header from './components/Header/Header'
import Login from './components/Header/Login'
import PageNotFound from './components/PageNotFound/PageNotFound'

const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'))
const Detail = React.lazy(() => import('./components/Detail/Detail'))
const Profile = React.lazy(() => import('./components/Profile/Profile'))
const Register = React.lazy(() => import('./components/Register/Register'))
const AuthorsIndex = React.lazy(() => import('./components/Authors/AuthorsIndex'))
const AuthorDetail = React.lazy(() => import('./components/Authors/AuthorDetail'))
import { Context } from './typescript/interfaces'
import { useAppDispatch } from './redux/store'
import store from './redux/store'
import { getRankingAction } from './redux/actions/poemsActions'

function PrivateRoute({ component: Component, ...rest }: RouteProps & { component: React.ComponentType<any> }) {
    const isLoggedIn = !!window.localStorage.getItem('loggedUser')
    return (
        <Route
            {...rest}
            render={props =>
                isLoggedIn ? <Component {...props} /> : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
            }
        />
    )
}

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

function App() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!store.getState().rankingQuery.item) {
            dispatch(getRankingAction({ params: { origin: 'user' } }))
        }
    }, [dispatch])

    const [contextState, setContextState] = useState({
        elementToEdit: '',
        user: '',
        userId: '',
        username: '',
        picture: '',
        bio: '',
        preferredGenres: [] as string[],
        name: '',
        surname: '',
        city: '',
        country: '',
        birthYear: null as number | null,
        gender: '',
        privateFields: [] as string[],
        config: {},
        // eslint-disable-next-line no-undef
        adminId: process.env.REACT_APP_ADMIN ?? '',
        setState(data: Context) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            const { setState, ...res } = data
            // Use functional setState to avoid stale closure issues
            setContextState(prevState => ({
                ...prevState,
                ...res
            }))
        }
    })

    return (
        <AppContext.Provider value={contextState}>
            <Router>
                <div className='container'>
                    <Header />

                    <div className='margin-body'>
                        <Suspense fallback={null}>
                            <Switch>
                                <PrivateRoute path='/profile' component={Profile} />
                                <Route path='/login' component={Login} />
                                <Route path='/register' component={Register} />
                                <Route path='/detail/:poemId' exact component={Detail} />
                                <Route path='/authors' exact component={AuthorsIndex} />
                                <Route path='/authors/:slug' exact component={AuthorDetail} />
                                <Route path='/:genre?' exact component={Dashboard} />
                                <Route component={PageNotFound} />
                            </Switch>
                        </Suspense>
                    </div>
                </div>
            </Router>
        </AppContext.Provider>
    )
}

export default App
