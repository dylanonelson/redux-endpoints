import URL from 'url-parse';

import { DEFAULT_KEY } from './constants';

/**
 * @private
 */
export const camelCase = spinal => (
  spinal.split('-').map((s, i) =>
    i !== 0
      ? (s[0].toUpperCase() + s.slice(1, s.length))
      : s
  ).join('')
);

/**
 * @private
 */
export const actionTypeCase = spinal => (
  spinal.replace(new RegExp('-', 'g'), '_').toUpperCase()
);

/**
 * @return {Object} initalEndpointState
 * Initial state for a branch of the state managed by an endpoint.
 */
export const initialEndpointState = () => ({
  data: null,
  error: null,
  pendingRequests: 0,
  successfulRequests: 0,
  totalRequests: 0,
});

/**
 * @private
 */
export const defaultResolver = () => DEFAULT_KEY;

/**
 * @private
 */
export const defaultRootSelector = state => state;

/**
 * @private
 */
export const defaultUrlBuilder = (params, urlString) => {
  const parsedUrl = new URL(urlString);
  // Thanks, Jeremy
  const namedParam = /(\(\?)?:\w+/g;
  const urlParamsSansColon = [];

  let match = true;

  while (match) {
    match = namedParam.exec(parsedUrl.pathname);
    if (match) {
      urlParamsSansColon.push(match[0].replace(/^:/, ''));
    }
  }

  let reqUrl = urlString;

  urlParamsSansColon.forEach(p => {
    reqUrl = reqUrl.replace(`:${p}`, params[p]);
  });

  return reqUrl;
};

/**
 * @private
 */
export const compose = (...funcs) => data => (
  funcs.reduceRight((v, f) => f(v), data)
);
