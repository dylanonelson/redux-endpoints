import { assert } from 'chai';

import { utils } from './context';

const { initialEndpointState } = utils;

import {
  completedRequestsSelector,
  dataSelector,
  errorSelector,
  hasBeenRequestedSelector,
  hasCompletedOnceSelector,
  isPendingSelector,
  pendingRequestsSelector,
  successfulRequestsSelector,
} from './context';

function getStateWithSuccessfulResponse(response) {
  const initial = initialEndpointState();
  initial.data = response;
  initial.completedRequests = 1;
  initial.successfulRequests = 1;
  return initial;
};

function getStateWithError(error) {
  const initial = initialEndpointState();
  initial.error = error;
  initial.completedRequests = 1;
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

function getStateWithSuccessfulRequests(num = 1, data = { one: 1 }) {
  const initial = initialEndpointState();
  initial.successfulRequests = num;
  initial.completedRequests = num;
  initial.data = data;
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

  it('hasBeenRequestedSelector returns true if any request has been initiated or completed', () => {
    let state = getStateWithSuccessfulRequests(3);
    let result = hasBeenRequestedSelector(state);
    expect(result).toBe(true);

    state = getStateWithPendingRequests(1);
    result = hasBeenRequestedSelector(state);
    expect(result).toBe(true);
  });

  it('hasBeenRequestedSelector returns false if the state is invalid', () => {
    const state = getStateWithNullData();
    const result = hasBeenRequestedSelector(state);
    expect(result).toBe(false);
  });

  it('hasCompletedOnceSelector returns true if any request has completed', () => {
    let state = getStateWithSuccessfulRequests(3);
    let result = hasCompletedOnceSelector(state);
    expect(result).toBe(true);

    state = getStateWithError(new Error('Uh oh'));
    result = hasCompletedOnceSelector(state);
    expect(result).toBe(true);
  });

  it('hasCompletedOnceSelector returns false if no requests have completed', () => {
    const state = initialEndpointState();
    const result = hasCompletedOnceSelector(state);
    expect(result).toBe(false);
  });

  it('hasCompletedOnceSelector returns false if the state is invalid', () => {
    const state = getStateWithNullData();
    const result = hasCompletedOnceSelector(state);
    expect(result).toBe(false);
  });

  it('pendingRequestsSelector returns the number of pending requests', () => {
    let state = getStateWithPendingRequests(3);
    let result = pendingRequestsSelector(state);
    expect(result).toBe(3);
  });

  it('pendingRequestsSelector returns 0 if the state is invalid', () => {
    const state = getStateWithNullData();
    const result = pendingRequestsSelector(state);
    expect(result).toBe(0);
  });
});

