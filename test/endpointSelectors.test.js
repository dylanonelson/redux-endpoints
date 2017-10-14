import { assert } from 'chai';

import { createEndpoint } from './context';
import { applyMiddleware, combineReducers, createStore } from 'redux';

const getEndpoint = (payload) => {
  return createEndpoint({
    name: 'test-endpoint',
    request: () => Promise.resolve(payload),
    resolver: id => id.toString(),
    rootSelector(state) { return state.test },
    url: '/test/:id',
  });
};

const getStore = (endpoint) => {
  const reducer = combineReducers({
    test: endpoint.reducer,
  });

  return createStore(reducer, {}, applyMiddleware(endpoint.middleware));
}

describe('endpoint selectors', () => {
  test('dataSelector resolves data at the correct path', () => {
    expect.assertions(1);

    const endpoint = getEndpoint({ foo: 'bar' });
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));

    const { selectors } = endpoint;

    const promise = new Promise((resolve) => {
      setImmediate(() => {
        const state = store.getState();
        resolve(selectors.getDataSelector(1000)(state));
      });
    });

    return expect(promise).resolves.toEqual({ foo: 'bar' });
  })

  test('dataSelector resolves data at the correct path when called twice', () => {
    expect.assertions(1);

    const endpoint = getEndpoint({ foo: 'bar' });
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));

    const { selectors } = endpoint;

    const promise = new Promise((resolve) => {
      setImmediate(() => {
        const state = store.getState();
        const first = selectors.getDataSelector(1000)(state);
        const second = selectors.getDataSelector(1000)(state);
        resolve(first === second);
      });
    });

    return expect(promise).resolves.toBe(true);
  })

  test('dataSelector returns null when there is no state at the selected path', () => {
    expect.assertions(1);

    const endpoint = getEndpoint({ foo: 'bar' });
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));

    const { selectors } = endpoint;

    const promise = new Promise((resolve) => {
      setImmediate(() => {
        const state = store.getState();
        resolve(selectors.getDataSelector(1001)(state));
      });
    });

    return expect(promise).resolves.toBe(null);
  })


  test('dataSelector returns the same function when called twice', () => {
    const endpoint = getEndpoint({ foo: 'bar' });
    const { selectors } = endpoint;
    const selFirst = selectors.getDataSelector(1000);
    const selSecond = selectors.getDataSelector(1000);
    expect(selFirst).toBe(selSecond);
  });

  test('errorSelector resolves an error at the correct path', () => {
    expect.assertions(1);

    const endpoint = getEndpoint(new Error('foo'));
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));

    const { selectors } = endpoint;

    const promise = new Promise((resolve) => {
      setImmediate(() => {
        const state = store.getState();
        resolve(selectors.getErrorSelector(1000)(state).message);
      });
    });

    return expect(promise).resolves.toBe('foo')
  })

  test('errorSelector returns null when there is no state at the path', () => {
    expect.assertions(1);

    const endpoint = getEndpoint(new Error('foo'));
    const store = getStore(endpoint);

    const { selectors } = endpoint;

    const promise = new Promise((resolve) => {
      setImmediate(() => {
        const state = store.getState();
        resolve(selectors.getErrorSelector(1000)(state));
      });
    });

    return expect(promise).resolves.toBe(null)
  })

  test('errorSelector resolves an error at the correct path when called twice', () => {
    expect.assertions(1);

    const endpoint = getEndpoint(new Error('foo'));
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));

    const { selectors } = endpoint;

    const promise = new Promise((resolve) => {
      setImmediate(() => {
        const state = store.getState();
        const first = selectors.getErrorSelector(1000)(state);
        const second = selectors.getErrorSelector(1000)(state);
        resolve(first === second);
      });
    });

    return expect(promise).resolves.toBe(true)
  })

  test('errorSelector returns the same function when called twice', () => {
    const endpoint = getEndpoint();
    const { selectors } = endpoint;
    const selFirst = selectors.getErrorSelector(1000);
    const selSecond = selectors.getErrorSelector(1000);
    expect(selFirst).toBe(selSecond);
  });

  test('isPending returns true when a request is pending', () => {
    const endpoint = getEndpoint();
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));
    const { selectors } = endpoint;
    const state = store.getState();
    expect(selectors.getIsPendingSelector(1000)(state)).toBe(true);
  })

  test('isPending returns the same result when called twice', () => {
    const endpoint = getEndpoint();
    const store = getStore(endpoint);
    store.dispatch(endpoint.actionCreators.request(1000));
    const { selectors } = endpoint;
    const state = store.getState();
    const first = selectors.getIsPendingSelector(1000)(state);
    const second = selectors.getIsPendingSelector(1000)(state);
    expect(first).toBe(second);
  })

  test('isPending returns false when there is no state at the selected path', () => {
    const endpoint = getEndpoint();
    const store = getStore(endpoint);
    const { selectors } = endpoint;
    const state = store.getState();
    const first = selectors.getIsPendingSelector(1000)(state);
    const second = selectors.getIsPendingSelector(1000)(state);
    expect(first).toBe(second);
  })

  test('isPendingSelector returns the same function when called twice', () => {
    const endpoint = getEndpoint();
    const { selectors } = endpoint;
    const selFirst = selectors.getIsPendingSelector(1000);
    const selSecond = selectors.getIsPendingSelector(1000);
    expect(selFirst).toBe(selSecond);
  });
});
