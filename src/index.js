import {
  compose,
  defaultResolver,
  defaultRootSelector,
  defaultUrlBuilder,
  initialEndpointState,
} from './utils';

import {
  dataSelector,
  errorSelector,
  isPendingSelector,
  successfulRequestsSelector,
  completedRequestsSelector,
} from './selectors';

export {
  dataSelector,
  errorSelector,
  isPendingSelector,
  successfulRequestsSelector,
  completedRequestsSelector,
};

export { initialEndpointState };

/**
 * @param {!Object} options
 * @param {!string} options.name
 * @param {!function(url: string, options: Object)}
 * @param {!string|function} options.url
 * @param {?function} options.resolver
 * @param {?function} options.rootSelector
 *
 * @return {Object} endpoint
 * @property {Object} actionCreators
 * @property {function} actionCreators.ingest
 * @property {function} actionCreators.request
 * @property {function} selector
 * @property {function} reducer
 * @property {function} middleware
 */
export const createEndpoint = ({
  name,
  request,
  url,
  resolver = defaultResolver,
  rootSelector = defaultRootSelector,
}) => {
  if ((typeof url === 'function' || typeof url === 'string') === false)
    throw new Error(`url option for redux-endpoints must be either a string or a function`);

  if (typeof name !== 'string')
    throw new Error(`name option for redux-endpoints must be a string`);

  if (typeof request !== 'function')
    throw new Error('request option for redux endpoints must be a function');

  const camelCaseName = name;

  const ingestActionType = `${camelCaseName}/INGEST_RESPONSE`;

  const requestActionType = `${camelCaseName}/MAKE_REQUEST`;

  const ingestActionCreator = (payload, meta) => {
    return {
      error: (payload instanceof Error) ? true : false,
      meta,
      payload,
      type: ingestActionType,
    };
  };

  ingestActionCreator.toString = () => ingestActionType;

  const requestActionCreator = (params = {}) => {
    let reqUrl;

    if (typeof url === 'function') {
      reqUrl = url(params);
    } else {
      reqUrl = defaultUrlBuilder(params, url);
    }

    return {
      meta: {
        params,
        path: resolver(params),
        url: reqUrl,
      },
      payload: {
        url: reqUrl,
      },
      type: requestActionType,
    };
  };

  requestActionCreator.toString = () => requestActionType;

  const actionCreators = {
    ingest: ingestActionCreator,
    ingestResponse: ingestActionCreator,
    makeRequest: requestActionCreator,
    request: requestActionCreator,
  };

  const middleware = store => next => action => {
    if (action.type === requestActionType) {
      request(action.payload.url, action.meta.params)
        .then(data => {
          store.dispatch(actionCreators.ingest(data, action.meta))
        })
        .catch(error => {
          let payload;

          if (error instanceof Error) {
            payload = error;
          } else {
            payload = new Error(error);
          }

          store.dispatch(actionCreators.ingest(payload, action.meta))
        });
    }
    return next(action);
  }

  const reducer = (previous = {}, action) => {
    let nextState = null;

    if (action.type === requestActionType) {
      nextState = Object.assign({}, previous);
      const path = action.meta.path;
      if (!nextState[path]) {
        const init = initialEndpointState();
        init.pendingRequests = 1;
        nextState[path] = init
      } else {
        nextState[path] = Object.assign({}, nextState[path]);
        nextState[path].pendingRequests += 1;
      }
    } else if (action.type === ingestActionType) {
      nextState = Object.assign({}, previous);
      const path = action.meta.path;
      const nextPathState = Object.assign({}, nextState[path]);
      nextState[path] = nextPathState;

      if (action.error) {
        const { payload } = action;
        const { message, name, stack } = payload;
        nextPathState.error = { message, name, stack }
        // Transfer custom properties as well
        Object.keys(payload).forEach((key) => {
          const value = payload[key];
          nextPathState.error[key] = value;
        });
      } else {
        nextPathState.data = action.payload;
        nextPathState.error = null;
        nextPathState.successfulRequests = (
          nextPathState.successfulRequests === undefined
            ? 1
            : nextPathState.successfulRequests + 1
        );
      }

      nextPathState.completedRequests = (
        nextPathState.completedRequests === undefined
        ? 1
        : nextPathState.completedRequests + 1
      );
      nextPathState.pendingRequests--;
    }

    if (nextState !== null)
      return nextState;

    return previous;
  };

  const selectorMap = {};

  const selector = (state, params) => {
    const path = resolver(params);
    let s;

    if (!selectorMap[path]) {
      s = state => (state && state[path]) || null;
      selectorMap[path] = s;
    } else {
      s = selectorMap[path];
    }

    return compose(
      s,
      rootSelector,
    )(state);
  };

  const selectors = {
    completedRequestsSelector: compose(completedRequestsSelector, selector),
    dataSelector: compose(dataSelector, selector),
    errorSelector: compose(errorSelector, selector),
    isPendingSelector: compose(isPendingSelector, selector),
    successfulRequestsSelector: compose(successfulRequestsSelector, selector),
  };

  return {
    actionCreators,
    middleware,
    reducer,
    selector,
    selectors,
  };
};
