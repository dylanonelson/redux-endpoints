import { assert } from 'chai';

import { endpoint } from 'fixtures/storeWithBasicGetModule';

describe('An endpoint request action creator', function() {

  let requestActionCreator, requestAction;

  beforeEach(function() {
    requestActionCreator = endpoint.actionCreators.request;
    requestAction = endpoint.actionCreators.request(1776);
  });

  it('is a function', function() {
    assert.isFunction(requestActionCreator);
  });

  context('returns an action object that', function() {

    it('is a plain object', function() {
      assert.isObject(requestAction);
    });

    it('has a type derived from its name property', function() {
      assert.strictEqual(requestAction.type, 'mockApi/REQUEST_MOCK_API_DATA');
    });

    it('has a payload containing the url', function() {
      assert.deepEqual(requestAction.payload, {
        url: 'http://localhost:1111/api/1776',
      })
    });

    it('has a meta property containing the named parameters', function() {
      assert.deepEqual(
        requestAction.meta,
        {
          params: { id: 1776 },
        },
      );
    });

  });

});
