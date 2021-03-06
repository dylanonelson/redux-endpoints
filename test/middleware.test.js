import { assert } from 'chai';
import configMockStore from 'redux-mock-store';

import {
  createEndpointWithDefaults,
  getRequestAndIngestActions,
} from './fixtures';
import { createEndpoint } from './context';

describe('Endpoint middleware', () => {

  let endpoint, requestAction, store;

  beforeEach(() => {
    endpoint = createEndpointWithDefaults({
      name: 'resourceApi',
      request: () => Promise.resolve('some_test_data'),
    });
    requestAction = endpoint.actionCreators.makeRequest({ id: 1776, foo: 'bar' });
    const getStore = configMockStore([endpoint.middleware]);
    store = getStore({});
  });

  test('triggers an ingest action', () => {
    store.dispatch(requestAction);

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        const actions = store.getActions();
        assert.strictEqual(actions.length, 2);

        const secondAction = actions[1];
        assert.strictEqual(secondAction.type, 'resourceApi/INGEST_RESPONSE');
        assert.strictEqual(secondAction.payload, 'some_test_data');
        resolve();
      });
    });
  });

  test('passes the meta properties from the request to the ingest action', () => {
    store.dispatch(requestAction);

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        const actions = store.getActions();
        const ingestAction = actions[1];
        assert.deepEqual(ingestAction.meta, requestAction.meta);
        resolve();
      });
    });
  });

  test('returns a promise which is resolved with the ingest action', () => {
    const promise = store.dispatch(requestAction);
    assert.instanceOf(promise, Promise);

    return promise.then(ingestAction => {
      assert.deepEqual(ingestAction.payload, 'some_test_data');
    });
  });

  test('returns a promise which is resolved with the error ingest action', () => {
    const error = new Error('test');

    endpoint = createEndpointWithDefaults({
      request: () => Promise.reject(error),
    });

    requestAction = endpoint.actionCreators.makeRequest({});

    const getStore = configMockStore([endpoint.middleware]);

    store = getStore({});

    const promise = store.dispatch(requestAction);

    assert.instanceOf(promise, Promise);

    return promise.then(ingestAction => {
      assert.strictEqual(ingestAction.payload, error);
    });
  });

  test('catches promises rejected with an error and creates an error ingest action', () => {
    endpoint = createEndpointWithDefaults({
      request: () => new Promise((resolve, reject) => reject(new Error('test'))),
    });
    const getStore = configMockStore([endpoint.middleware]);
    store = getStore({});
    requestAction = endpoint.actionCreators.request();
    store.dispatch(requestAction);

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        const actions = store.getActions();
        const ingestAction = actions[1];
        assert(ingestAction.error);
        assert.strictEqual(ingestAction.payload.message, 'test');
        resolve();
      });
    });
  });

  test('catches promises rejected with non-Error values and creates an error ingest action', () => {
    endpoint = createEndpointWithDefaults({
      request: () => new Promise((resolve, reject) => reject('test')),
    });
    const getStore = configMockStore([endpoint.middleware]);
    store = getStore({});
    requestAction = endpoint.actionCreators.request();
    store.dispatch(requestAction);

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        const actions = store.getActions();
        const ingestAction = actions[1];
        assert(ingestAction.error);
        assert.strictEqual(ingestAction.payload.message, 'test');
        resolve();
      });
    });
  });
});
