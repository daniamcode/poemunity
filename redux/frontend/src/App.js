import React, { useState } from 'react'
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import './App.scss'
import Dashboard from './components/Dashboard'
import Detail from './components/Detail'
import Header from './components/Header'
import Profile from './components/Profile'
import PageNotFound from './components/PageNotFound'

export const AppContext = React.createContext();

function App (props) {
  const [contextState, setContextState] = useState({
    sortPoemsBy: '',
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
