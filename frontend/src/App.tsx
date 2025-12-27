import React, { useState } from 'react'
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import './App.scss'
import Dashboard from './components/Dashboard/Dashboard'
import Detail from './components/Detail/Detail'
import Header from './components/Header/Header'
import Profile from './components/Profile/Profile'
import Login from './components/Header/Login'
import Register from './components/Register/Register'
import PageNotFound from './components/PageNotFound/PageNotFound'
import { Context } from './typescript/interfaces'

export const AppContext = React.createContext<Context>({
    elementToEdit: '',
    user: '',
    userId: '',
    username: '',
    picture: '',
    config: {},
    adminId: '',
    setState: () => {}
})

function App() {
    const [contextState, setContextState] = useState({
        elementToEdit: '',
        user: '',
        userId: '',
        username: '',
        picture: '',
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
                        <Switch>
                            <Route path='/' exact component={Dashboard} />
                            <Route path='/profile' component={Profile} />
                            <Route path='/login' component={Login} />
                            <Route path='/register' component={Register} />
                            <Route path='/detail/:poemId' exact component={Detail} />
                            <Route path='/:genre' exact component={Dashboard} />
                            <Route component={PageNotFound} />
                        </Switch>
                    </div>
                </div>
            </Router>
        </AppContext.Provider>
    )
}

export default App
