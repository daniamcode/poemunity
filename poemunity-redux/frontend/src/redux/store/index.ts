// import { applyMiddleware, createStore } from 'redux';
// import { createLogger }                 from 'redux-logger';
// import thunk                            from 'redux-thunk';
// import { composeWithDevTools }          from 'redux-devtools-extension';

// const { NODE_ENV } = process.env

// let configureStore
// if (NODE_ENV !== 'production') {
//     const enhancer = composeWithDevTools(
//         applyMiddleware(thunk, createLogger()),
//     );

//     configureStore = function configureStore(initialState) {
//         return createStore(rootReducer, initialState, enhancer);
//     };
// } else {
//     configureStore = function configureStore(initialState) {
//         return createStore(rootReducer, initialState, applyMiddleware(thunk));
//     };
// }

// export default configureStore;

import { configureStore } from '@reduxjs/toolkit'
import {rootReducer}      from '../reducers/rootReducer';


const store = configureStore({
    reducer: rootReducer,
  })
  
export default store
