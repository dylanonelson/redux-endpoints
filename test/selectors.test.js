import { assert } from 'chai';

import { utils } from './context';

const { initialEndpointState } = utils;

import {
  dataSelector,
  errorSelector,
  isPendingSelector,
  completedRequestsSelector,
  successfulRequestsSelector,
} from './context';

function getStateWithSuccessfulResponse(response) {
  const initial = initialEndpointState();
  initial.data = response;
  return initial;
};

function getStateWithError(error) {
  const initial = initialEndpointState();
  initial.error = error;
  return initial;
};

function getStateWithPendingRequests(num = 1) {
  const initial = initialEndpointState();
  initial.pendingRequests = num;
  return initial;
};

function getStateWithNullData() {
  return null;
};

function getStateWithCompletedRequests(num = 1) {
  const initial = initialEndpointState();
  initial.completedRequests = num;
  return initial;
};

function getStateWithSuccessfulRequests(num = 1) {
  const initial = initialEndpointState();
  initial.successfulRequests = num;
  return initial;
};

describe('Selectors', function () {
  it('dataSelector returns the data from the last successful request', function () {
    const state = getStateWithSuccessfulResponse({ status: 'OK' });
    assert.deepEqual(dataSelector(state), { status: 'OK' });
  });

  it('dataSelector returns null if the data is null', function () {
    const state = getStateWithNullData();
    const result = dataSelector(state);
    assert.strictEqual(result, null);
  });

  it('errorSelector returns the error from an unsuccessful request', function () {
    const e = new Error('Bad request');
    e.name = 'Fetch error';
    const state = getStateWithError(e);
    const result = errorSelector(state);
    assert.strictEqual(result, e);
  });

  it('errorSelector returns null if the data is null', function () {
    const state = getStateWithNullData();
    const result = errorSelector(state);
    assert.strictEqual(result, null);
  });

  it('isPendingSelector returns true if there is one or more pending requests', function () {
    const state = getStateWithPendingRequests(1);
    const result = isPendingSelector(state);
    assert.strictEqual(result, true);
  });

  it('isPendingSelector returns false if the data is null', function () {
    const state = getStateWithNullData();
    const result = isPendingSelector(state);
    assert.strictEqual(result, false);
  });

  it('isPendingSelector returns false if there are no pending requests', function () {
    const state = getStateWithPendingRequests(0);
    const result = isPendingSelector(state);
    assert.strictEqual(result, false);
  });

  it('completedRequestsSelector returns the number of total requests', () => {
    const state = getStateWithCompletedRequests(3);
    const result = completedRequestsSelector(state);
    expect(result).toBe(3);
  });

  it('completedRequestsSelector returns 0 if the state is invalid', () => {
    const state = getStateWithNullData();
    const result = completedRequestsSelector(state);
    expect(result).toBe(0);
  });

  it('successfulRequestsSelector returns the number of successfulRequests', () => {
    const state = getStateWithSuccessfulRequests(3);
    const result = successfulRequestsSelector(state);
    expect(result).toBe(3);
  });

  it('successfulRequestsSelector returns 0 if the state is invalid', () => {
    const state = getStateWithNullData();
    const result = successfulRequestsSelector(state);
    expect(result).toBe(0);
  });
});

