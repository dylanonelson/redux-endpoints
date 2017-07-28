# redux-endpoints
> Define Redux modules for fetching data from API endpoints

![Build status](https://travis-ci.org/dylanonelson/redux-endpoints.svg?branch=master)

## Motivation
I found myself writing a lot of boilerplate code every time I wanted to fetch data and ingest it into my Redux store. First, I would define some actions for requesting and ingesting the data. Then I would define a reducer to process those actions. Then I would define some middleware or a saga to intercept the "request" action and fire off the "ingest" one once the API call was complete. Establishing all the cross references and integrating the module into my Redux setup was tedious and error prone. More importantly, I quickly realized that for simple cases I was doing the exact same thing every time, with minor variations caused only by slips of memory or spells of laziness. I made redux-endpoints as a way to truly standardize this type of module definition.

## Example
```js
// src/redux-modules/resourceApi/index.js
import { createEndpoint } from 'redux-endpoints';

const ep = createEndpoint({
  // Must be spinal case
  name: 'resource-api',
  // Receives the url as a parameter and must return a promise
  request: url => new Promise((resolve, reject) => (
    fetch(url, { credentials: 'include' })
      .then(resp => resp.json())
      .then(json => resolve(json))
  )),
  // Receives the url params as arguments and returns the key in the state
  // where the request data will be stored
  resolver: id => id,
  // Url pattern for requests
  url: '/api/resource/:id',
});

const {
  actionCreators,
  actionTypes,
  middleware,
  selectors,
  reducer,
} = ep;

export {
  actionCreators,
  actionTypes,
  middleware,
  selectors,
};

export default reducer;
```

```js
// src/redux-store/index.js
import { applyMiddleware, createStore } from 'redux';

import endpointReducer, { middleware } from 'redux-modules/resourceApi';

const middleware = applyMiddleware(
  middleware,
);

const reducer = combineReducers({
  resourceApi: endpointReducer,
});

const store = createStore(reducer, {}, middleware);
```

```js
// whereveryouwant.js
import store from 'redux-store';

import { actionCreators } from 'redux-modules/resourceApi';

store.dispatch(actionCreators.request(1));
```

The code above triggers:
1. An action, `resourceApi/MAKE_RESOURCE_API_REQUEST`,
1. A fetch to the url `/api/resource/1`, and
1. An action, `resourceApi/INGEST_RESOURCE_API_RESPONSE`.

At the end of the whole thing, the `resourceApi` branch of your state will look as follows:
```json
{
  "1": {
    "pendingRequests": 0,
    "data": {
      "id": 1,
      "server_attribute": "server_value"
    }
  }
}
```
