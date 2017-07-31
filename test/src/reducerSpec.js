import { assert } from 'chai';

import { utils } from './context';
import { constants } from './context';

import {
  basicEndpoint,
  endpointWithDefaultResolver,
} from 'fixtures';

describe('An endpoint reducer', function() {

  let endpoint, ingestAction, reducer, requestAction;

  context('from a basic endpoint', function() {

    beforeEach(function() {
      endpoint = basicEndpoint;
      reducer = endpoint.reducer;
      requestAction = basicEndpoint.actionCreators.request(1776);
      ingestAction = basicEndpoint.actionCreators.ingest('test', requestAction.meta);
    });

    it('initializes an empty request object for the request action', function() {
      const expected = utils.initialEndpointState();
      expected.pendingRequests = 1;
      const result = reducer({}, requestAction);
      assert.deepEqual(result[1776], expected);
    });

    it('decrements the pendingRequests counter for the ingest action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result['1776'].pendingRequests, 0);
    });

    it('increments the pendingRequests counter for the request action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, requestAction);
      assert.strictEqual(result['1776'].pendingRequests, 2);
    });

    it('updates the data at the correct path for the ingest action', function() {
      const previous = {
        '1776': {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.deepEqual(result['1776'].data, 'test');
    });

  });

  context('with a default resolver', function() {

    beforeEach(function() {
      endpoint = endpointWithDefaultResolver;
      reducer = endpoint.reducer;
      requestAction = endpoint.actionCreators.request();
      ingestAction = endpoint.actionCreators.ingest('test', requestAction.meta);
    });

    it('initializes an empty request object for the request action', function() {
      const expected = utils.initialEndpointState();
      expected.pendingRequests = 1;
      const result = reducer({}, requestAction);
      assert.deepEqual(result[constants.DEFAULT_KEY], expected);
    });

    it('decrements the pendingRequests counter for the ingest action', function() {
      const previous = {
        [constants.DEFAULT_KEY]: {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, ingestAction);
      assert.strictEqual(result[constants.DEFAULT_KEY].pendingRequests, 0);
    });

    it('increments the pendingRequests counter for the request action', function() {
      const previous = {
        [constants.DEFAULT_KEY]: {
          data: null,
          pendingRequests: 1,
        },
      };

      const result = reducer(previous, requestAction);
      assert.strictEqual(result[constants.DEFAULT_KEY].pendingRequests, 2);
    });

    it('updates the data at the correct path for the ingest action', function() {
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
