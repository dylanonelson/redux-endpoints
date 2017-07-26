import { combineReducers, createStore } from 'redux';

import { createEndpoint, endpointReducer } from '../context';

const endpoint = createEndpoint({
  url: '/api/:id',
});

const reducer = combineReducers({
  api: endpointReducer,
});

const store = createStore(reducer, { api: {} });

export { endpoint };

export default store;
