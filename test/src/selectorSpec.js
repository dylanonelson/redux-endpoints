import { assert } from 'chai';

import { basicEndpoint } from 'fixtures';
import { createEndpoint } from './context';

const getComplexResolverEndpoint = () => createEndpoint({
  name: 'resource-api',
  request: url => (
    new Promise((resolve, reject) => {
      fetch(url)
        .then(resp => resp.json())
        .then(json => resolve(json))
        .catch(error => reject(error));
    })
  ),
  resolver: (resourceType, id) => `${resourceType}__${id}`,
  url: 'http://localhost:1111/api/:resource-type/:id',
});

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

  it('returns the data at the resolved path', function() {
    const expected = {
      data: 'test',
      pendingRequests: 0,
    };

    assert.deepEqual(selector(1776)(state), expected);
  });

  it('returns data at the resolved path for a complex resolver', function() {
    selector = getComplexResolverEndpoint().selector;

    const expected = {
      data: 'test',
      pendingRequests: 0,
    };

    state = {
      ['books__1']: {
        data: 'test',
        pendingRequests: 0,
      },
    };

    assert.deepEqual(selector('books', 1)(state), expected);
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
