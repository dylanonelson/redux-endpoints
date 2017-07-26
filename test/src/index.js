import { assert } from 'chai';

import './index.html';
import { createEndpoint } from './context.js';
import { storeWithBasicGetModule } from './fixtures';

describe('A Redux endpoint module', function() {

  let ep;

  before(function() {
    ep = createEndpoint({
      branch: id => id,
      request: (url) => new Promise((resolve, reject) => {
        fetch(url)
          .then(resp => resp.json())
          .then(json => resolve(json))
          .catch(err => reject(err));
      }),
      url: 'http://localhost:1105/resource/:id',
    });
  });

  it('is an object', function() {
    assert.isObject(ep);
  });

  it('defines actions', function() {
    assert.isObject(ep.actions);
  });

  it('defines middleware', function() {
    assert.isFunction(ep.middleware);
  });

  it('defines a reducer', function() {
    assert.isFunction(ep.reducer);
  });
});
