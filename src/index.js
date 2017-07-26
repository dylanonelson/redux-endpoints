import './index.html';
import { camelCase, actionTypeCase } from './utils';

export const createEndpoint = ({ name, url }) => {
  const actionTypeCaseName = actionTypeCase(name);
  const camelCaseName = camelCase(name);

  const actionCreators = {
    request: (...params) => {
      return {
        type: `${camelCaseName}/REQUEST_${actionTypeCaseName}_DATA`,
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
