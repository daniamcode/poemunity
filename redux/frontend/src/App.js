import React from 'react'
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import './App.scss'
import Dashboard from './components/Dashboard'
import Detail from './components/Detail'
import Header from './components/Header'
import Profile from './components/Profile'
import PageNotFound from './components/PageNotFound'

function App (props) {
  return (
    <Router>
      <div className='container'>
        <Header />

        <div className='margin-body'>
          <Switch>
            <Route path='/' exact component={Dashboard} />
            <Route path='/perfil' component={Profile} />
            <Route path='/:genre' exact component={Dashboard} />
            <Route path='/detalle/:poemId' exact component={Detail} />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </div>
    </Router>
  )
}


export default App
