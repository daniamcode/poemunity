import { applyMiddleware, createStore } from 'redux';
import { createLogger }                 from 'redux-logger';
import thunk                            from 'redux-thunk';
import { composeWithDevTools }          from 'redux-devtools-extension';

import rootReducer      from '../reducers';

const { NODE_ENV } = process.env


// eslint-disable-next-line import/no-mutable-exports
let configureStore;
if (NODE_ENV !== 'production') {
    const enhancer = composeWithDevTools(
        applyMiddleware(thunk, createLogger()),
    );

    // eslint-disable-next-line no-shadow
    configureStore = function configureStore(initialState) {
        return createStore(rootReducer, initialState, enhancer);
    };
} else {
    // eslint-disable-next-line no-shadow
    configureStore = function configureStore(initialState) {
        return createStore(rootReducer, initialState, applyMiddleware(thunk));
    };
}

export default configureStore;
