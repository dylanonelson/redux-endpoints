import { assert } from 'chai';

import { createEndpoint } from './context';

import { createEndpointWithDefaults } from './fixtures';

describe('An endpoint selector', function() {
  it('returns the data at the resolved path when there is neither a rootSelector nor a resolver (twice)', function() {
    const endpoint = createEndpointWithDefaults();
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

    assert.deepEqual(selector(state.resourceApi), expected);
    assert.deepEqual(selector(state.resourceApi), expected);
  });

  it('returns data at the resolved path for a complex resolver (twice)', function() {
    const endpoint = createEndpointWithDefaults({
      resolver: ({ resourceType, id }) => `${resourceType}__${id}`,
    });
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

    assert.deepEqual(selector(state.resourceApi, { id: 1, resourceType: 'books' }), expected);
    assert.deepEqual(selector(state.resourceApi, { id: 1, resourceType: 'books' }), expected);
  });

  it('returns data at the resolved path when a rootSelector is provided (twice)', () => {
    const endpoint = createEndpointWithDefaults({
      rootSelector: state => state.resources,
    });
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
    const endpoint = createEndpointWithDefaults();
    const { selector } = endpoint;

    const state = {
      nothing: 'to see here',
    };

    expect(selector(state)).toBe(null);
    expect(selector(state, 'something')).toBe(null);
  });

  it('returns null when the rootSelector returns falsy', () => {
    const endpoint = createEndpointWithDefaults({
      rootSelector: state => state.test,
    });
    const { selector } = endpoint;

    const state = {
      nothing: 'to see here',
    };

    expect(selector(state)).toBe(null);
    expect(selector(state, 'something')).toBe(null);
  });
});
