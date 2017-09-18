import { assert } from 'chai';

import { createEndpoint } from './context.js';

describe('A Redux endpoint module', function() {

  let ep;

  beforeEach(function() {
    ep = createEndpoint({
      name: 'mock-api',
      url: 'http://localhost:1105/resource/:id',
    });
  });

  test('is an object', function() {
    assert.isObject(ep);
  });

  test('defines actionCreators', function() {
    assert.isObject(ep.actionCreators);
  });

  test('defines middleware', function() {
    assert.isFunction(ep.middleware);
  });

  test('defines a reducer', function() {
    assert.isFunction(ep.reducer);
  });

});
