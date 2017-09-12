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
    }

    if (action.type === ingestActionType) {
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
