import { assert } from 'chai';

import { basicEndpoint } from 'fixtures';

describe('An endpoint selector', function() {

  let selectors, state;

  beforeEach(function() {
    selectors = basicEndpoint.selectors;

    state = {
      '1776': {
        data: 'test',
        pendingRequests: 0,
      },
    };
  });

  it('returns the data at the resolved path when passed the same parameters', function() {
    const expected = 'test';
    assert.strictEqual(selectors(1776)(state), expected);
  });

  it('returns a function, even when called multiple times', function() {
    const first = selectors(1776);
    const second = selectors(1776);
    assert.isFunction(first);
    assert.isFunction(second);
  });

  it('returns the same function on the second call', function() {
    const first = selectors(1776);
    const second = selectors(1776);
    assert.strictEqual(first, second);
    assert.isFunction(first);
  });

  it('returns null if the path is not present', function() {
    assert.strictEqual(selectors('yo')(state), null);
  });

});
