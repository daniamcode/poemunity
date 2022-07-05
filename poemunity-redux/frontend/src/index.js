import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux';
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import store from './redux/store';

const queryClient = new QueryClient();
// export const store = configureStore();

console.log(`Environment is: ${process.env.NODE_ENV}`);

const root = document.getElementById('root');

if(root) {
  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
      <QueryClientProvider client={queryClient}>
          <App />
      <ReactQueryDevtools />
      </QueryClientProvider>
      </Provider>
    </React.StrictMode>,
    root
  )
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
