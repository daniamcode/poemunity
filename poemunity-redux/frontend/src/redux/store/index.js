import { applyMiddleware, createStore } from 'redux';
import { createLogger }                 from 'redux-logger';
import thunk                            from 'redux-thunk';
import { composeWithDevTools }          from 'redux-devtools-extension';

import rootReducer      from '../reducers';

const { NODE_ENV } = process.env


let configureStore = undefined;
if (NODE_ENV !== 'production') {
    const enhancer = composeWithDevTools(
        applyMiddleware(thunk, createLogger()),
    );

    configureStore = function configureStore(initialState) {
        return createStore(rootReducer, initialState, enhancer);
    };
} else {
    configureStore = function configureStore(initialState) {
        return createStore(rootReducer, initialState, applyMiddleware(thunk));
    };
}

export default configureStore;
