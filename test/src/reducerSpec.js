import { assert } from 'chai';

import { utils } from './context';
import { basicEndpoint } from 'fixtures';

describe('An endpoint reducer', function() {

  let ingestAction, reducer, requestAction;

  beforeEach(function() {
    reducer = basicEndpoint.reducer;
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
