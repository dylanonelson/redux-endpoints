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

});

