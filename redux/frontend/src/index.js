import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth0Provider } from "@auth0/auth0-react";

let redirectUri = "http://localhost:3000/perfil"
if (process.env.NODE_ENV === 'production') {
  redirectUri = 'https://poemunity.com/perfil'
}

const {REACT_APP_AUTH0_DOMAIN, REACT_APP_AUTH0_CLIENTID} = process.env
//same as process.env.AUTH0_DOMAIN, but cleaner


ReactDOM.render(
  <React.StrictMode>
    <Router>
       <Auth0Provider
    domain={REACT_APP_AUTH0_DOMAIN}
    clientId={REACT_APP_AUTH0_CLIENTID}
    redirectUri={redirectUri}
    >
			<App />
    </Auth0Provider>
		</Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
