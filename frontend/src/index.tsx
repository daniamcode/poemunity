import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import store from './redux/store'

// export const store = configureStore();

// eslint-disable-next-line no-console, no-undef
console.log(`Environment is: ${process.env.NODE_ENV}`)

const root = document.getElementById('root')

if (root) {
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(
        <React.StrictMode>
            <Provider store={store}>
                <App />
            </Provider>
        </React.StrictMode>,
        root
    )
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
