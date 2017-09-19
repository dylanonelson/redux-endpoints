import URL from 'url-parse';

import { DEFAULT_KEY } from './constants';
import { camelCase, actionTypeCase, initialEndpointState } from './utils';

export {
  dataSelector,
  errorSelector,
  isPendingSelector,
} from './selectors';

export { initialEndpointState };

const defaultResolver = () => DEFAULT_KEY;

/**
 * @param {!Object} options
 * @param {!string} options.name The name for this endpoint. Will be used to
 * derive the action names. Must be provided in spinal case. E.g. `my-api` will
 * be transformed to action name `myApi/MAKE_MY_API_REQUEST`.
 * @param {!function(url: string, options: Object)} options.request
 * Takes the url to be requested as well as an options object optionally
 * supplied to the `request` action creator. Must return a Promise object which
 * resolves with the successfully requested data and rejects with either a
 * string value or an Error object.
 * @param {!string} options.url
 * The url to be requested when store dispatches the `request` action. May
 * include any number of url parameters denoted by colons. E.g.
 * `'/myapi/content/:id'`.
 * @param {?function} options.resolver
 * Takes as its arguments the url parameters denoted in options.url with colors.
 * Takes as its last, optional argument an options object.
 *
 * @return {Object} endpoint
 * @property {Object} actionCreators
 * @property {function} actionCreators.ingest
 * The ingest action creator is primarily for internal use, but it is exported
 * because its `toString` method returns its action type.
 * @property {function} actionCreators.request
 * Takes as its arguments the url parameters denoted in options.url with colons.
 * E.g. `'/myapi/content/:id'` results in a request action creator that takes
 * one argument, the `id` parameter. In addition, takes as its last, optional
 * argument an options object to pass in turn to the options.request function.
 * @property {function} selector Takes the same arguments as the passed
 * resolver. If no resolver is supplied, it receives no arguments. Returns a
 * selector that takes the root piece of state where this endpoint's data is
 * stored and returns the piece of state for the url that the arguments resolve to.
 * @property {function} reducer Redux reducer.
 * @property {function} middleware Redux middleware.
 */
export const createEndpoint = ({
  name,
  request,
  url,
  resolver = defaultResolver,
}) => {
  const actionTypeCaseName = actionTypeCase(name);
  const camelCaseName = camelCase(name);

  const parsedUrl = new URL(url);
  // Thanks, Jeremy
  const namedParam = /(\(\?)?:\w+/g;
  const urlParams = [];

  let match = true;

  while (match) {
    match = namedParam.exec(parsedUrl.pathname);
    if (match) urlParams.push(match[0]);
  }

  const ingestActionType =
    `${camelCaseName}/INGEST_${actionTypeCaseName}_RESPONSE`;

  const requestActionType =
    `${camelCaseName}/MAKE_${actionTypeCaseName}_REQUEST`;

  const ingestActionCreator = (payload, meta) => {
    return {
      error: (payload instanceof Error) ? true : false,
      meta,
      payload,
      type: ingestActionType,
    };
  };

  ingestActionCreator.toString = () => ingestActionType;

  const requestActionCreator = (...params) => {
    let options = {}, reqUrl = url;

    urlParams.forEach((p, i) => {
      reqUrl = reqUrl.replace(p, params[i]);
    });

    if (typeof params[params.length - 1] === 'object') {
      options = params[params.length - 1];
    }

    const metaParams = urlParams.reduce((memo, p, i) => {
      memo[p.replace(':', '')] = params[i];
      return memo;
    }, {});

    return {
      meta: {
        params: metaParams,
        path: resolver(...params),
        url: reqUrl,
      },
      payload: {
        options,
        url: reqUrl,
      },
      type: requestActionType,
    };
  };

  requestActionCreator.toString = () => requestActionType;

  const actionCreators = {
    ingest: ingestActionCreator,
    request: requestActionCreator,
  };

  const middleware = store => next => action => {
    if (action.type === requestActionType) {
      request(action.payload.url, action.payload.options)
        .then(data =>
          store.dispatch(actionCreators.ingest(data, action.meta))
        )
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
        const { message, name } = action.payload;
        nextPathState.error = { message, name }
      } else {
        nextPathState.data = action.payload;
        nextPathState.error = null;
        nextPathState.successfulRequests = (
          nextPathState.successfulRequests === undefined
            ? 1
            : nextPathState.successfulRequests + 1
        );
      }

      nextPathState.totalRequests = (
        nextPathState.totalRequests === undefined
        ? 1
        : nextPathState.totalRequests + 1
      );
      nextPathState.pendingRequests--;
    }

    if (nextState !== null)
      return nextState;

    return previous;
  };

  const selectorMap = {};

  const selector = (...params) => {
    const path = resolver(...params);
    let s;

    if (!selectorMap[path]) {
      s = state => (state[path] && state[path]) || null;
      selectorMap[path] = s;
    } else {
      s = selectorMap[path];
    }

    return s;
  };

  return {
    actionCreators,
    middleware,
    reducer,
    selector,
  };
};
