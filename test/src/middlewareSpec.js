import { assert } from 'chai';
import configMockStore from 'redux-mock-store';

import { basicEndpoint } from 'fixtures';

describe('Endpoint middleware', function() {

  let requestAction, store;

  beforeEach(function() {
    const getStore = configMockStore([basicEndpoint.middleware]);
    store = getStore({});
    requestAction = basicEndpoint.actionCreators.request(1776, { foo: 'bar' });
  });

  it('triggers an ingest action', function(done) {
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      assert.strictEqual(actions.length, 2);

      const secondAction = actions[1];
      assert.strictEqual(secondAction.type, 'mockApi/INGEST_MOCK_API_RESPONSE');
      done();
    });
  });

  it('passes the meta properties from the request to the ingest action', function(done) {
    store.dispatch(requestAction);

    setImmediate(() => {
      const actions = store.getActions();
      const ingestAction = actions[1];
      assert.deepEqual(ingestAction.meta, requestAction.meta);
      done();
    });
  });

});
