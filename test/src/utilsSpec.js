import { assert } from 'chai';

import { utils } from './context';

describe('utils', function() {

  context('#camelCase', function() {

    let str;

    beforeEach(function() {
      str = 'mock-api';
    });

    it ('transforms spinal to camel case', function() {
      assert.strictEqual(utils.camelCase(str), 'mockApi');
    });

  });

  context('#actionTypeCase', function() {

    let str;

    beforeEach(function() {
      str = 'mock-api';
    });

    it ('transforms spinal to camel case', function() {
      assert.strictEqual(utils.actionTypeCase(str), 'MOCK_API');
    });

  });

  context('#initialEndpointState', function() {

    let state;

    beforeEach(function() {
      state = utils.initialEndpointState();
    });

    it('returns an object with the proper format', function() {
      const expected = {
        data: null,
        error: null,
        pendingRequests: 0,
      };
      assert.deepEqual(state, expected);
    });

  });

});

