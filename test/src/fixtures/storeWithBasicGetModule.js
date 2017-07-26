import { applyMiddleware, combineReducers, createStore } from 'redux';

import { createEndpoint } from '../context';

const endpoint = createEndpoint({
  name: 'mock-api',
  url: 'http://localhost:1111/api/:id',
});

const reducer = combineReducers({
  api: endpoint.reducer,
});

const middleware = applyMiddleware(
  endpoint.middleware,
);

const initialState = {
  api: {},
};

const store = createStore(reducer, initialState, middleware);

export { endpoint };

export default store;
