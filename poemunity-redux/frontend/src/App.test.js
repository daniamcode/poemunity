import { render, screen } from '@testing-library/react';
import App from './App';
import {Provider} from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import rootReducer from './redux/reducers/rootReducer';
import {createStore, applyMiddleware, compose} from "redux";
import thunk from 'redux-thunk';
import store from './redux/store'
import {
    QueryClient,
    QueryClientProvider,
  } from "react-query"
import '@testing-library/jest-dom'

describe("App", () => {
    test('renders some text', () => {
        // const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        // const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
        const queryClient = new QueryClient();

        
        render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            </QueryClientProvider>
        </Provider>);

        const textElement = screen.getByText(/Your poem community!/);
        
        expect(textElement).toBeInTheDocument();
    });
});


