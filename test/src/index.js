import { assert } from 'chai';

import './actionCreatorsSpec';
import './index.html';
import './utilsSpec';
import { createEndpoint } from './context.js';

describe('A Redux endpoint module', function() {

  let ep;

  before(function() {
    ep = createEndpoint({
      name: 'mock-api',
      url: 'http://localhost:1105/resource/:id',
    });
  });

  it('is an object', function() {
    assert.isObject(ep);
  });

  it('defines actionCreators', function() {
    assert.isObject(ep.actionCreators);
  });

  it('defines middleware', function() {
    assert.isFunction(ep.middleware);
  });

  it('defines a reducer', function() {
    assert.isFunction(ep.reducer);
  });
});
