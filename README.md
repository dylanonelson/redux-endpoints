# redux-endpoints
> Define Redux modules for fetching data from API endpoints

![Build status](https://travis-ci.org/dylanonelson/redux-endpoints.svg?branch=master)

## Motivation
I found myself writing a lot of boilerplate code every time I wanted to fetch data and ingest it into my Redux store. First, I would define some actions for requesting and ingesting the data. Then I would define a reducer to process those actions. Then I would define some middleware or a saga to intercept the "request" action and fire off the "ingest" one once the API call was complete. Establishing all the cross references and integrating the module into my Redux setup was tedious and error prone. More importantly, I quickly realized that for simple cases I was doing the exact same thing every time, with minor variations caused only by slips of memory or spells of laziness. I made redux-endpoints as a way to standardize this type of module definition.

## Example
```js
// src/redux-modules/resourceApi/index.js
import { createEndpoint } from 'redux-endpoints';

const endpoint = createEndpoint({
  // Module name (required)
  name: 'resourceApi',
  // Receives the url as a parameter and must return a promise (required)
  request: (url, params) => new Promise((resolve, reject) => (
    fetch(url, { credentials: 'include' })
      .then(resp => resp.json())
      .then(json => resolve(json))
  )),
  // Receives the url params as an argument and returns the key in the state
  // where the request data will be stored (optional)
  resolver: ({ id }) => id,
  // Where in the root-level state the selector function should look for request
  // data (optional)
  rootSelector: state => state.resourceApi,
  // Url pattern for requests - can be function or string (required)
  url: '/api/resource/:id', // OR url: ({ id }) => `/api/resource/${id}`,
});

const {
  actionCreators,
  middleware,
  selector,
  reducer,
} = endpoints;

export {
  actionCreators,
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

store.dispatch(actionCreators.request({ id: 1 }));
```

The code above triggers:
1. An action, `resourceApi/MAKE_REQUEST`,
1. A fetch to the url `/api/resource/1`, and
1. An action, `resourceApi/INGEST_RESPONSE`.

At the end of the whole thing, your state will look as follows:
```js
{
  resourceApi: {
    "1": {
      pendingRequests: 0,
      completedRequests: 1,
      successfulRequests: 1,
      data: {
        id: 1,
        server_attribute: "server_value"
      }
    }
  }
}
```

If something went wrong with your request and the Promise were rejected, your state would look as follows:
```js
{
  resourceApi: {
    "1": {
      pendingRequests: 0,
      completedRequests: 1,
      successfulRequests: 0,
      data: null,
      error: {
        message: "Something went wrong with the request",
        name: "Error"
      }
    }
  }
}
```

## Options

### `name`
Required. The name of this redux module. Should be unique in your app. Used to construct the action names, i.e., `${name}/MAKE_REQUEST` and `${name}/INGEST_RESPONSE`.

### `request`
Required. A function that returns a Promise. The `request` function is called by the endpoint's middleware (`endpoint.middleware`) when the `request` action is fired (`endpoint.actionCreators.request`). It takes two arguments:

1. The url to request
1. The parameters passed the the `makeRequest` action creator.

The data that the Promise resolves (or rejects) with will be passed to the `ingest` action creator (`endpoint.actionCreators.ingest`) and incorporated into the store at the path determined by the `resolver` option (see below). Data the Promise resolves with is stored under the `'data'` key; data the Promise rejects with is stored under the `'error'` key.

### `url`
Required. A string or a function. If a string, optionally has colon-prefixed url parameters. If a function, takes the parameters passed to the `makeRequest` action creator. Should return the url.

### `resolver`
Optional. A function that takes the parameters passed to the `makeRequest` action creator. Should return the key where the endpoint's data will be stored.

Defaults to a function which returns a default string (`'__default__'`).

E.g. in the code above, requesting data with `endpoint.actionCreators.request({ id: 1000 })` would result in the data stored under they key `'1000'` by the reducer.

### `rootSelector`
Optional. A function that takes the state as its sole parameter and returns the branch of the state the endpoint’s reducer (`endpoint.reducer`) is responsible for. So if you call `combineReducers({ my_key: endpoint.reducer })`, your `rootSelector` would be `(state => state.my_key)`. It’s called by the `selector` function when retrieving request data from the top-level state. Defaults to `(state => state)`.

## Methods

### `endpoint.reducer`

A reducer to manage the slice of state where you choose to store your data from this url or set of urls.

### `endpoint.middleware`

A redux middleware function. Pass it into your `createStore` call to enable the `request` action creator to trigger your data requests.

### `endpoint.actionCreators`

Action creators for this endpoint. See below.

#### `endpoint.actionCreators.request`

Creates an `request` action. The action type is namespaced according to the `name` of your endpoint. E.g. in the code above, `resourceApi/MAKE_REQUEST`. Takes as its sole argument the parameters used to create both the `url` (either via a function or a url string with colon-prefixed parameters) and when calling the `resolver` function, if one exists. E.g.,

```javascript
dispatch(actionCreators.request({ id: 1000 }));
```

The `request` action creator's `toString` method returns its action type.

#### `endpoint.actionCreators.ingest`
Creates an ingest action. This action creator is called by the middleware once your endpoint's `request` Promise resolves or rejects. The ingest action creator is primarily for internal use, but it is exported because its `toString` method returns its action type.

### `endpoint.selector`
A selector for retrieving request data. Its first argument is the state. Its second argument is the parameters passed to the `resolver` to determine the path at which the request’s data is stored. The `selector` function calls the `rootSelector`, if one is provided, and then the `resolver` to determine which piece of state you want. E.g. in the code above:

```javascript
// Retrieve endpoint data for url /api/resource/1000
const endpointData = selector(state, { id: 1000 });
```

### `endpoint.selectors`

Selectors for working with request data.

#### `endpoint.selectors.completedRequestsSelector`
Takes the same arguments as `endpoint.selector`. Returns the number of completed (either successful or failed) requests.

```javascript
// Retrieve the number of completed requests to url /api/resources/1000
const numCompletedRequests = endpoint.selectors.completedRequestsSelector(staet, { id: 1000 });
```

#### `endpoint.selectors.dataSelector`
Takes the same arguments as `endpoint.selector`. Returns the data returned by the last successful request (or null).

#### `endpoint.selectors.errorSelector`
Takes the same arguments as `endpoint.selector`. Returns the error thrown by the last failed request (or null).

#### `endpoint.selectors.isPendingSelector`
Takes the same arguments as `endpoint.selector`. Returns `true` if there is a request (or multiple requests) pending. Otherwise, returns `false`.

#### `endpoint.selectors.successfulRequestsSelector`
Takes the same arguments as `endpoint.selector`. Returns the number of successful requests.

#### `endpoint.selectors.hasBeenRequestedSelector`
Takes the same arguments as `endpoint.selector`. Returns `true` if any request has been initiated or completed to this url.

#### `endpoint.selectors.hasBeenCompletedOnceSelector`
Takes the same arguments as `endpoint.selector`. Returns `true` if any request, whether failed or successful, has been completed o this url.

#### `endpoint.selectors.pendingRequestsSelector`
Takes the same arguments as `endpoint.selector`. Returns the number of requests currently pending to this url.
