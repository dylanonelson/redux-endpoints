import { assert } from 'chai';
import configMockStore from 'redux-mock-store';

import { basicEndpoint } from './fixtures';
import { createEndpoint } from './context';

describe('Endpoint middleware', function() {

  let requestAction, store;

  beforeEach(function() {
    const getStore = configMockStore([basicEndpoint.middleware]);
    store = getStore({});
    requestAction = basicEndpoint.actionCreators.request(1776, { foo: 'bar' });
  });

  test('triggers an ingest action', function(done) {
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      assert.strictEqual(actions.length, 2);

      const secondAction = actions[1];
      assert.strictEqual(secondAction.type, 'mockApi/INGEST_MOCK_API_RESPONSE');
      done();
    });
  });

  test('passes the meta properties from the request to the ingest action', function(done) {
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      const ingestAction = actions[1];
      assert.deepEqual(ingestAction.meta, requestAction.meta);
      done();
    });
  });

  test('passes the url property from the request action as a meta property on the ingest action', function(done) {
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      const ingestAction = actions[1];
      assert.strictEqual(ingestAction.meta.url, requestAction.payload.url);
      done();
    });
  });

  test('catches promises rejected with an error and creates an error ingest action', function(done) {
    const getErrorEndpoint = () => createEndpoint({
      name: 'test-api',
      request: () => new Promise((resolve, reject) => {
        reject(new Error('test'));
      }),
      url: 'http://localhost:1111/api/:id',
    });

    const ep = getErrorEndpoint();
    const getStore = configMockStore([ep.middleware]);
    store = getStore({});
    requestAction = ep.actionCreators.request();
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      const ingestAction = actions[1];
      assert(ingestAction.error);
      assert.strictEqual(ingestAction.payload.message, 'test');
      done();
    });
  });

  test('catches promises rejected with non-Error values and creates an error ingest action', function(done) {
    const getErrorEndpoint = () => createEndpoint({
      name: 'test-api',
      request: () => new Promise((resolve, reject) => {
        reject('test');
      }),
      url: 'http://localhost:1111/api/:id',
    });

    const ep = getErrorEndpoint();
    const getStore = configMockStore([ep.middleware]);
    store = getStore({});
    requestAction = ep.actionCreators.request();
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      const ingestAction = actions[1];
      assert(ingestAction.error);
      assert.strictEqual(ingestAction.payload.message, 'test');
      done();
    });
  });

});
