import { utils } from './context';

const { initialEndpointState } = utils;

import {
  dataSelector,
  errorSelector,
  isPendingSelector,
} from './context';

const getStateWithSuccessfulResponse = (response) => {
  const initial = initialEndpointState();
  initial.data = response;
  return initial;
};

const getStateWithError = (error) => {
  const initial = initialEndpointState();
  initial.error = error;
  return initial;
};

const getStateWithPendingRequests = function (num = 1) {
  const initial = initialEndpointState();
  initial.pendingRequests = num;
  return initial;
};

const getStateWithNullData = function () {
  return null;
};

describe('Selectors', function () {
  it('dataSelector returns the data from the last successful request', function () {
    const state = getStateWithSuccessfulResponse({ status: 'OK' });
    expect(dataSelector(state)).toEqual({ status: 'OK' });
  });

  it('dataSelector returns null if the data is null', function () {
    const state = getStateWithNullData();
    const result = dataSelector(state);
    expect(result).toBe(null);
  });

  it('errorSelector returns the error from an unsuccessful request', function () {
    const e = new Error('Bad request');
    e.name = 'Fetch error';
    const state = getStateWithError(e);
    const result = errorSelector(state);
    expect(result).toBe(e);
  });

  it('errorSelector returns null if the data is null', function () {
    const state = getStateWithNullData();
    const result = errorSelector(state);
    expect(result).toBe(null);
  });

  it('isPendingSelector returns true if there is one or more pending requests', function () {
    const state = getStateWithPendingRequests(1);
    const result = isPendingSelector(state);
    expect(result).toBe(true);
  });

  it('isPendingSelector returns false if the data is null', function () {
    const state = getStateWithNullData();
    const result = isPendingSelector(state);
    expect(result).toBe(false);
  });

  it('isPendingSelector returns false if there are no pending requests', function () {
    const state = getStateWithPendingRequests(0);
    const result = isPendingSelector(state);
    expect(result).toBe(false);
  });
});

