import URL from 'url-parse';

import './index.html';
import { camelCase, actionTypeCase } from './utils';

export const createEndpoint = ({ name, url }) => {
  const actionTypeCaseName = actionTypeCase(name);
  const camelCaseName = camelCase(name);

  const parsedUrl = new URL(url);
  const namedParam = /(\(\?)?:\w+/g;
  const urlParams = [];

  let match = true;

  while (match) {
    match = namedParam.exec(parsedUrl.pathname);
    if (match) urlParams.push(match[0]);
  }

  const actionCreators = {
    request: (...params) => {
      let reqUrl = url;

      urlParams.forEach((p, i) => {
        reqUrl = reqUrl.replace(p, params[i]);
      });

      const meta = urlParams.reduce((memo, p, i) => {
        memo[p.replace(':', '')] = params[i];
        return memo;
      }, {});

      return {
        type: `${camelCaseName}/REQUEST_${actionTypeCaseName}_DATA`,
        meta,
        payload: {
          url: reqUrl,
        },
      };
    },
  };

  const middleware = store => next => action => next(action);

  const reducer = (previous = {}, action) => {
    return previous;
  };

  return {
    actionCreators,
    middleware,
    reducer,
  };
};
