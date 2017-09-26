# redux-endpoints
> Define Redux modules for fetching data from API endpoints

![Build status](https://travis-ci.org/dylanonelson/redux-endpoints.svg?branch=master)

## Motivation
I found myself writing a lot of boilerplate code every time I wanted to fetch data and ingest it into my Redux store. First, I would define some actions for requesting and ingesting the data. Then I would define a reducer to process those actions. Then I would define some middleware or a saga to intercept the "request" action and fire off the "ingest" one once the API call was complete. Establishing all the cross references and integrating the module into my Redux setup was tedious and error prone. More importantly, I quickly realized that for simple cases I was doing the exact same thing every time, with minor variations caused only by slips of memory or spells of laziness. I made redux-endpoints as a way to truly standardize this type of module definition.

## Documentation
You can [read the docs](https://dylanonelson.github.io/redux-endpoints/) for the master branch on GitHub pages.

## Example
```js
// src/redux-modules/resourceApi/index.js
import { createEndpoint } from 'redux-endpoints';

const endpoint = createEndpoint({
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
  selector,
  reducer,
} = endpoints;

export {
  actionCreators,
  actionTypes,
  middleware,
  selector,
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
    "totalRequests": 1,
    "successfulRequests": 1,
    "data": {
      "id": 1,
      "server_attribute": "server_value"
    }
  }
}
```

If something went wrong with your request and the Promise were rejected, the `resourceApi` branch of your state would look as follows:
```json
{
  "1": {
    "pendingRequests": 0,
    "totalRequests": 1,
    "successfulRequests": 0,
    "data": null,
    "error": {
      "message": "Something went wrong with the request",
      "name": "Error"
    }
  }
}
```

## Options

### `name`
Required. The name of this endpoint. Must be provided in spinal case.

### `request`
Required. A function that returns a Promise. The `request` function is called by the endpoint's middleware (`endpoint.middleware`) when the `request` action is fired (`endpoint.actionCreators.request`). It takes two arguments:

1. The url to request
1. Any further options passed to the `request` action creator

The data that resolves the Promise will be passed to the `ingest` action creator (`endpoint.actionCreators.ingest`) and incorporated into the store at the path determined by the `resolver` option (see below). Any errors that reject the promise will be incorporated into the store at the same path under the `'error'` key.

### `url`
Required. A string. Optionally has colon-delimited url parameters.

### `resolver`
Optional. A function that takes as its arguments the colon-delimited url parameters in the `url` option. Should return the key where the endpoint's data will be stored.

Defaults to a function which returns a default string (`__default__`).

E.g. in the code above, requesting data with `endpoint.actionCreators.request(1000)` would result in the data stored under they key `'1000'` by the reducer.

## Methods

### `endpoint.reducer`

A reducer to manage the slice of state where you choose to store your data from this url.

### `endpoint.middleware`

A redux middleware function. Pass it into your `createStore` call to enable the `request` action creator to trigger your data requests.

### `endpoint.actionCreators`

Action creators for this endpoint. See below.

#### `endpoint.actionCreators.request`

Creates an `request` action. The action type is named and namespaced according to the `name` of your endpoint. E.g. in the code above, `resourceApi/MAKE_RESOURCE_API_REQUEST`. Takes as its arguments the colon-delimited url parameters in the `url` of your endpoint. E.g. in the code above:

```javascript
const id = 1000;
dispatch(actionCreators.request(id));
```

The `request` action creator's `toString` method returns its action type.

#### `endpoint.actionCreators.ingest`
Creates an ingest action. This action creator is called by the middleware once your endpoint's `request` Promise resolves. The ingest action creator is primarily for internal use, but it is exported because its `toString` method returns its action type.

### `endpoint.selector`
A function to create selectors. Just like the `request` action creator, it takes as its arguments the colon-delimited url parameters in the `url` of your endpoint. E.g. in the code above:

```javascript
// Retrieve endpoint data for url /api/resource/1000
const endpointData = selector(1000)(state)`;
```

It returns a selector that takes as its argument the piece of state managed by the endpoint's reducer (`endpoint.reducer`).
