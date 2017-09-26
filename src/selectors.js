/**
 * @param {Object} state A piece of state attached to one url.
 * @return {Object|null} Either the data most recently fetched from that url or null if there is none.
 */
export const dataSelector = (state) => {
  if (state && state.data) {
    return state.data;
  }

  return null;
};

/**
 * @param {Object} state A piece of state attached to one url.
 * @return {Object|null} error Either an error, if there was one during the last request, or null.
 * @property {string} name
 * @property {string} message
 */
export const errorSelector = (state) => {
  if (state && state.error) {
    return state.error;
  }

  return null;
};

/**
 * @param {Object} state A piece of state attached to one url.
 * @return {boolean} isPending Whether there is a request pending for that url.
 */
export const isPendingSelector = (state) => {
  if (state && state.pendingRequests) {
    return state.pendingRequests > 0;
  }

  return false;
};

/**
 * @param {Object} state A piece of state attached to one url.
 * @return {boolean} totalRequests How many requests, successful or unsuccessful, have been made to this url.
 */
export const totalRequestsSelector = (state) => {
  if (state && typeof state.totalRequests === 'number') {
    return state.totalRequests;
  }

  return 0;
};

/**
 * @param {Object} state A piece of state attached to one url.
 * @return {boolean} totalRequests How many successful requests have been made to this url. A successful request is a request whose Promise is not rejected.
 */
export const successfulRequestsSelector = (state) => {
  if (state && typeof state.successfulRequests === 'number') {
    return state.successfulRequests;
  }

  return 0;
};
