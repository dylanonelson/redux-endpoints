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
