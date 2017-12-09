import { assert } from 'chai';

import { constants, utils } from './context';
import { createEndpointWithDefaults } from './fixtures';

describe('An endpoint reducer', function() {
  describe('from a basic endpoint', function() {
    test('initializes an empty request object for the request action', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: (({ id }) => `__${id}__`),
      });
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const expected = utils.initialEndpointState();
      expected.pendingRequests = 1;
      const result = endpoint.reducer(undefined, requestAction);
      assert.deepEqual(result['__1776__'], expected);
    });

    test('decrements the pendingRequests counter for the ingest action', function() {
      const endpoint = createEndpointWithDefaults();
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse('test', requestAction.meta);

      const previous = {
        '__default__': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = endpoint.reducer(previous, ingestAction);
      assert.strictEqual(result['__default__'].pendingRequests, 0);
    });

    test('increments the pendingRequests counter for the request action', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: (({ id }) => id),
      });
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });

      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = endpoint.reducer(previous, requestAction);
      assert.strictEqual(result['1776'].pendingRequests, 2);
    });

    test('increments the completedRequests counter for the ingest action', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: (({ id }) => id),
      });
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse('test', requestAction.meta);

      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
          completedRequests: 0,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].completedRequests, 1);
    });

    test('increments the successfulRequests counter for a successful ingest action', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: ({ id }) => id,
      });
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse({}, requestAction.meta);

      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
          successfulRequests: 0,
          completedRequests: 0,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].successfulRequests, 1);
    });

    test('updates the data at the correct path for the ingest action', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: ({ id }) => id,
      });
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse('test', requestAction.meta);

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
      const endpoint = createEndpointWithDefaults({
        resolver: ({ id }) => id,
      });
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse('test', requestAction.meta);

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

    test('increments the completedRequests counter but not the successfulRequests counter if the ingest action includes an error', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: ({ id }) => id,
      });
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });

      const data = {
        foo: 'bar',
      };

      const previous = {
        '1776': {
          data,
          pendingRequests: 1,
          successfulRequests: 0,
          completedRequests: 0,
        },
      };

      const errorMsg = 'There was a problem with the request';

      const errorAction = endpoint.actionCreators.ingest(
        new Error(errorMsg),
        requestAction.meta,
      );

      const result = endpoint.reducer(previous, errorAction);
      const state = result['1776'];

      assert.strictEqual(state.successfulRequests, 0);
      assert.strictEqual(state.completedRequests, 1);
    });

    test('leaves the data node untouched and parses the payload as an error if there was one', function() {
      const endpoint = createEndpointWithDefaults({
        resolver: ({ id }) => id,
      });
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });

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

      const result = endpoint.reducer(previous, errorAction);

      assert.strictEqual(result['1776'].data, data);

      assert.deepEqual(result['1776'].error, {
        message,
        name,
        stack,
        customProp,
      });
    });

    test('returns the previous state if processing an action that is neither request nor ingest', () => {
      const endpoint = createEndpointWithDefaults({
        resolver: ({ id }) => id,
      });

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

      const result = endpoint.reducer(previous, randomAction);

      expect(result).toBe(previous);
    });

  });

  describe('with a default resolver', function() {
    test('initializes an empty request object for the request action', function() {
      const endpoint = createEndpointWithDefaults();
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });

      const expected = utils.initialEndpointState();
      expected.pendingRequests = 1;
      const result = endpoint.reducer({}, requestAction);
      assert.deepEqual(result[constants.DEFAULT_KEY], expected);
    });

    test('decrements the pendingRequests counter for the ingest action', function() {
      const endpoint = createEndpointWithDefaults();
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse(
        'test',
        requestAction.meta
      );

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
      const endpoint = createEndpointWithDefaults();
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });

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
      const endpoint = createEndpointWithDefaults();
      const { reducer } = endpoint;
      const requestAction = endpoint.actionCreators.makeRequest({ id: 1776 });
      const ingestAction = endpoint.actionCreators.ingestResponse('test', requestAction.meta);

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
