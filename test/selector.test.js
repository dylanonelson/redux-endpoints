import { assert } from 'chai';

import { createEndpoint } from './context';

const getEndpointDefaults = () => ({
  name: 'resource-api',
  request: url => (
    new Promise((resolve, reject) => {
      fetch(url)
        .then(resp => resp.json())
        .then(json => resolve(json))
        .catch(error => reject(error));
    })
  ),
  url: 'http://localhost:1111/api/:id',
});

const getBasicEndpoint = () => createEndpoint(getEndpointDefaults());

const getComplexResolverEndpoint = (cb) => createEndpoint(Object.assign(
  {},
  getEndpointDefaults(),
  {
    resolver: cb,
  }
));

const getEndpointWithRootSelector = (cb) => createEndpoint(Object.assign(
  {},
  getEndpointDefaults(),
  {
    rootSelector: cb,
  },
));

describe('An endpoint selector', function() {
  it('returns the data at the resolved path when there is neither a rootSelector nor a resolver (twice)', function() {
    const endpoint = getBasicEndpoint();
    const { selector } = endpoint;

    const state = {
      resourceApi: {
        __default__: {
          data: 'test',
          pendingRequests: 0,
        }
      }
    };

    const expected = {
      data: 'test',
      pendingRequests: 0,
    };

    assert.deepEqual(selector(state.resourceApi, 1776), expected);
    assert.deepEqual(selector(state.resourceApi, 1776), expected);
  });

  it('returns data at the resolved path for a complex resolver (twice)', function() {
    const endpoint = getComplexResolverEndpoint((resourceType, id) => `${resourceType}__${id}`,)
    const { selector } = endpoint;

    const expected = {
      data: 'test',
      pendingRequests: 0,
    };

    const state = {
      resourceApi: {
        ['books__1']: {
          data: 'test',
          pendingRequests: 0,
        },
      }
    };

    assert.deepEqual(selector(state.resourceApi, 'books', 1), expected);
    assert.deepEqual(selector(state.resourceApi, 'books', 1), expected);
  });

  it('returns data at the resolved path when a rootSelector is provided (twice)', () => {
    const endpoint = getEndpointWithRootSelector(state => state.resources);
    const { selector } = endpoint;

    const state = {
      resources: {
        __default__: {
          test: 'foo',
        }
      }
    };

    const expected = {
      test: 'foo',
    };

    expect(selector(state)).toEqual({ test: 'foo' });
    expect(selector(state)).toEqual({ test: 'foo' });
  });

  it('returns null when there is no data at the resolved path', () => {
    const endpoint = getBasicEndpoint();
    const { selector } = endpoint;

    const state = {
      nothing: 'to see here',
    };

    expect(selector(state)).toBe(null);
    expect(selector(state, 'something')).toBe(null);
  });

  it('returns null when the rootSelector returns falsy', () => {
    const endpoint = getEndpointWithRootSelector(state => state.test);
    const { selector } = endpoint;

    const state = {
      nothing: 'to see here',
    };

    expect(selector(state)).toBe(null);
    expect(selector(state, 'something')).toBe(null);
  });
});
