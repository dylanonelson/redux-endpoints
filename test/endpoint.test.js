import { assert } from 'chai';

import { createEndpoint } from './context.js';
import { createEndpointWithDefaults } from './fixtures';

describe('The createEndpoint function', () => {
  test('throws an error if the url option is the wrong type', () => {
    const createEndpointWithError = () => createEndpointWithDefaults({
      url: null,
    });

    expect(createEndpointWithError).toThrow();
  });

  test('throws an error if the name option is missing', () => {
    const createEndpointWithError = () => createEndpointWithDefaults({
      name: {},
    });

    expect(createEndpointWithError).toThrow();
  });

  test('throws an error if the request option is missing', () => {
    const createEndpointWithError = () => createEndpointWithDefaults({
      request: '',
    });

    expect(createEndpointWithError).toThrow();
  });
});

describe('A Redux endpoint module', function() {

  let ep;

  beforeEach(function() {
    ep = createEndpointWithDefaults({
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
