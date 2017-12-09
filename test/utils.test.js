import { assert } from 'chai';

import { utils } from './context';

describe('utils', () => {
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
        completedRequests: 0,
      };
      assert.deepEqual(state, expected);
    });

  });

  describe('#compose', () => {
    it('composes functions together (twice)', () => {
      const f1 = (a) => a + 1;
      const f2 = (b) => b * 2;
      expect(utils.compose(f2, f1)(1)).toBe(4);
      expect(utils.compose(f2, f1)(1)).toBe(4);
    });
    it('accepts multiple arguments (twice)', () => {
      const f1 = (a, b) => a + b;
      const f2 = (c) => c * 2;
      expect(utils.compose(f2, f1)(1, 2)).toBe(6);
      expect(utils.compose(f2, f1)(1, 2)).toBe(6);
    });
  });
});

