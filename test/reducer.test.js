import { assert } from 'chai';

import { utils } from './context';
import { constants } from './context';

import {
  basicEndpoint,
  endpointWithDefaultResolver,
} from './fixtures';

describe('An endpoint reducer', function() {

  let endpoint, ingestAction, reducer, requestAction;

  describe('from a basic endpoint', function() {

    beforeEach(function() {
      endpoint = basicEndpoint;
      reducer = endpoint.reducer;
      requestAction = basicEndpoint.actionCreators.request(1776);
      ingestAction = basicEndpoint.actionCreators.ingest('test', requestAction.meta);
    });

    test('initializes an empty request object for the request action', function() {
      const expected = utils.initialEndpointState();
      expected.pendingRequests = 1;
      const result = reducer(undefined, requestAction);
      assert.deepEqual(result[1776], expected);
    });

    test('decrements the pendingRequests counter for the ingest action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].pendingRequests, 0);
    });

    test('increments the pendingRequests counter for the request action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, requestAction);
      assert.strictEqual(result['1776'].pendingRequests, 2);
    });

    test('increments the totalRequests counter for the ingest action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
          totalRequests: 0,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].totalRequests, 1);
    });

    test('increments the successfulRequests counter for a successful ingest action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
          successfulRequests: 0,
          totalRequests: 0,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].successfulRequests, 1);
    });

    test('updates the data at the correct path for the ingest action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].data, 'test');
    });

    test('sets the error key to null if the request was successful', function() {
      const previous = {
        '1776': {
          data: null,
          error: {
            message: 'There was a problem with the request',
            name: 'Error',
          },
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.deepEqual(result['1776'].data, 'test');
      assert.strictEqual(result['1776'].error, null);
    });

    test('increments the totalRequests counter but not the successfulRequests counter if the ingest action includes an error', function() {
      const data = {
        foo: 'bar',
      };

      const previous = {
        '1776': {
          data,
          pendingRequests: 1,
          successfulRequests: 0,
          totalRequests: 0,
        },
      };

      const errorMsg = 'There was a problem with the request';

      const errorAction = endpoint.actionCreators.ingest(
        new Error(errorMsg),
        requestAction.meta,
      );

      const result = reducer(previous, errorAction);
      const state = result['1776'];

      assert.strictEqual(state.successfulRequests, 0);
      assert.strictEqual(state.totalRequests, 1);
    });

    test('leaves the data node untouched and parses the payload as an error if there was one', function() {
      const data = {
        foo: 'bar',
      };

      const previous = {
        '1776': {
          data,
          pendingRequests: 1,
        },
      };

      const error = new Error('There was a problem with the request');

      error.customProp = 'foo';

      const errorAction = endpoint.actionCreators.ingest(
        error,
        requestAction.meta,
      );

      const { customProp, message, name, stack } = error;

      const result = reducer(previous, errorAction);

      assert.strictEqual(result['1776'].data, data);

      assert.deepEqual(result['1776'].error, {
        message,
        name,
        stack,
        customProp,
      });
    });

    test('returns the previous state if processing an action that is neither request nor ingest', () => {
      const previous = {
        '1776': {
          data: 'foo',
          pendingRequests: 1,
        }
      };

      const randomAction = {
        type: 'NOT_RECOGNIZED',
        payload: false,
      };

      const result = reducer(previous, randomAction);

      expect(result).toBe(previous);
    });

  });

  describe('with a default resolver', function() {

    beforeEach(function() {
      endpoint = endpointWithDefaultResolver;
      reducer = endpoint.reducer;
      requestAction = endpoint.actionCreators.request();
      ingestAction = endpoint.actionCreators.ingest('test', requestAction.meta);
    });

    test('initializes an empty request object for the request action', function() {
      const expected = utils.initialEndpointState();
      expected.pendingRequests = 1;
      const result = reducer({}, requestAction);
      assert.deepEqual(result[constants.DEFAULT_KEY], expected);
    });

    test('decrements the pendingRequests counter for the ingest action', function() {
      const previous = {
        [constants.DEFAULT_KEY]: {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result[constants.DEFAULT_KEY].pendingRequests, 0);
    });

    test('increments the pendingRequests counter for the request action', function() {
      const previous = {
        [constants.DEFAULT_KEY]: {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, requestAction);
      assert.strictEqual(result[constants.DEFAULT_KEY].pendingRequests, 2);
    });

    test('updates the data at the correct path for the ingest action', function() {
      const previous = {
        [constants.DEFAULT_KEY]: {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.deepEqual(result[constants.DEFAULT_KEY].data, 'test');
    });

  });

});
