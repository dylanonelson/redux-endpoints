import { assert } from 'chai';

import { utils } from './context';

describe('utils', () => {

  describe('#camelCase', () => {

    let str;

    beforeEach(() => {
      str = 'mock-api';
    });

    it ('transforms spinal to camel case', () => {
      assert.strictEqual(utils.camelCase(str), 'mockApi');
    });

  });

  describe('#actionTypeCase', () => {

    let str;

    beforeEach(() => {
      str = 'mock-api';
    });

    it ('transforms spinal to screaming snake case', () => {
      assert.strictEqual(utils.actionTypeCase(str), 'MOCK_API');
    });

    it('transforms strings with multiple dashes to screaming snake case', () => {
      assert.strictEqual(utils.actionTypeCase('mock-api-test'), 'MOCK_API_TEST');
    });

  });

  describe('#initialEndpointState', () => {

    let state;

    beforeEach(() => {
      state = utils.initialEndpointState();
    });

    it('returns an object with the proper format', () => {
      const expected = {
        data: null,
        error: null,
        pendingRequests: 0,
        successfulRequests: 0,
        totalRequests: 0,
      };
      assert.deepEqual(state, expected);
    });

  });

  describe('#compose', () => {
    it('composes functions together', () => {
      const f1 = (a) => a + 1;
      const f2 = (b) => b * 2;
      expect(utils.compose(f2, f1)(1)).toBe(4);
    });
  });
});

