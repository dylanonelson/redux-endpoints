import URL from 'url-parse';

import { DEFAULT_KEY } from './constants';

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
