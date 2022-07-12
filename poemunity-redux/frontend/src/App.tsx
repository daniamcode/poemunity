import React, { useState } from 'react'
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import './App.scss'
import Dashboard from './components/Dashboard'
import Detail from './components/Detail'
import Header from './components/Header'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'
import PageNotFound from './components/PageNotFound'
import { Context } from './typescript/interfaces'

export const AppContext = React.createContext<Context>({
    elementToEdit: '',
    user: '',
    userId: '',
    username: '',
    picture: '',
    config: {},
    adminId: '',
    setState: () => {},
})

function App () {
  const [contextState, setContextState] = useState({
    elementToEdit: '',
    user: '',
    userId: '',
    username: '',
    picture: '',
    config: {},
    adminId: process.env.REACT_APP_ADMIN ?? '',
    setState(data: Context) {
      const { setState, ...res } = data;
      const newState = { ...contextState, ...res };
      setContextState(newState);
    },
  });

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
              <Route path='/:genre' exact component={Dashboard} />
              <Route path='/detail/:poemId' exact component={Detail} />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </div>
      </Router>
    </AppContext.Provider>

  )
}


export default App
