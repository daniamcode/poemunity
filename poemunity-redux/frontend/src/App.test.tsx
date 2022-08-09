import { render, screen } from '@testing-library/react';
import App from './App';
import {Provider} from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './redux/store'
import '@testing-library/jest-dom'

describe("App", () => {
    test('renders some text', () => {
        // const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        // const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
        
        render(
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>);

        const textElement = screen.getByText(/Your poem community!/);
        
        expect(textElement).toBeInTheDocument();
    });
});


