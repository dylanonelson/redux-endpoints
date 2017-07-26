import URL from 'url-parse';

import './index.html';
import { camelCase, actionTypeCase } from './utils';

export const createEndpoint = ({ name, request, url, resolver }) => {
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
    `${camelCaseName}/INGEST_${actionTypeCaseName}_DATA`;

  const requestActionType =
    `${camelCaseName}/REQUEST_${actionTypeCaseName}_DATA`;

  const actionCreators = {
    ingest: (payload, meta) => {
      return {
        meta,
        payload,
        type: ingestActionType,
      };
    },
    request: (...params) => {
      let reqUrl = url;

      urlParams.forEach((p, i) => {
        reqUrl = reqUrl.replace(p, params[i]);
      });

      const metaParams = urlParams.reduce((memo, p, i) => {
        memo[p.replace(':', '')] = params[i];
        return memo;
      }, {});

      return {
        meta: {
          params: metaParams,
          path: resolver(...params),
        },
        payload: {
          url: reqUrl,
        },
        type: requestActionType,
      };
    },
  };

  const middleware = store => next => action => {
    if (action.type === requestActionType) {
      request(action.payload.url).then(data =>
        store.dispatch(actionCreators.ingest(data, action.meta))
      );
    }
    return next(action);
  }

  const reducer = (previous = {}, action) => {
    return previous;
  };

  return {
    actionCreators,
    middleware,
    reducer,
  };
};
