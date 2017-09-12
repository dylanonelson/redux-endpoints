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
    expect(typeof ep).toBe('object');
  });

  it('defines actionCreators', function() {
    expect(typeof ep.actionCreators).toBe('object');
  });

  it('defines middleware', function() {
    expect(typeof ep.middleware).toBe('function');
  });

  it('defines a reducer', function() {
    expect(typeof ep.reducer).toBe('function');
  });

});
