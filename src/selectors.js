export const dataSelector = (state) => {
  if (state && state.data) {
    return state.data;
  }

  return null;
};

export const errorSelector = (state) => {
  if (state && state.error) {
    return state.error;
  }

  return null;
};

export const isPendingSelector = (state) => {
  if (state && state.pendingRequests) {
    return state.pendingRequests > 0;
  }

  return false;
};
