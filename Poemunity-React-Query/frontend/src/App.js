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

export const AppContext = React.createContext();

function App (props) {
  const [contextState, setContextState] = useState({
    elementToEdit: '',
    user: null,
    userId: '',
    username: '',
    config: {},
    adminId: process.env.NODE_ENV === 'development' 
      ? process.env.REACT_APP_ADMIN_PRE
      : process.env.REACT_APP_ADMIN,
    setState(data) {
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
