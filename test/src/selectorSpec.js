import { assert } from 'chai';

import { basicEndpoint } from 'fixtures';
import { constants } from './context';

describe('An endpoint selector', function() {

  let selector, state;

  beforeEach(function() {
    selector = basicEndpoint.selector;

    state = {
      '1776': {
        data: 'test',
        pendingRequests: 0,
      },
    };
  });

  it('returns the data at the resolved path when passed', function() {
    const expected = 'test';
    assert.strictEqual(selector(1776)(state), expected);
  });

  it('returns data at the default path when no argument is passed', function() {
    const expected = 'test';

    state = {
      [constants.DEFAULT_KEY]: {
        data: 'test',
        pendingRequests: 0,
      },
    };

    assert.strictEqual(selector()(state), expected);
  });

  it('returns a function, even when called multiple times', function() {
    const first = selector(1776);
    const second = selector(1776);
    assert.isFunction(first);
    assert.isFunction(second);
  });

  it('returns the same function on the second call', function() {
    const first = selector(1776);
    const second = selector(1776);
    assert.strictEqual(first, second);
    assert.isFunction(first);
  });

  it('returns null if the path is not present', function() {
    assert.strictEqual(selector('yo')(state), null);
  });

});
