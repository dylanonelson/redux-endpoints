import { assert } from 'chai';
import resourceJson from './mock-api/json/resource.json';

import { createEndpointWithDefaults } from './fixtures';

describe('An endpoint request action creator', () => {

  let endpoint, requestActionCreator, requestAction;

  beforeEach(() => {
    endpoint = createEndpointWithDefaults({
      name: 'mock-api',
      url: 'http://localhost:1111/api/:id',
      resolver: ({ id }) => id,
    });
    requestActionCreator = endpoint.actionCreators.request;
    requestAction = endpoint.actionCreators.request({ id: 1776, foo: 'bar' });
  });

  test('is a function', () => {
    assert.isFunction(requestActionCreator);
  });

  test('has a `toString` method which returns the correct action type', () => {
    const expected = 'mockApi/MAKE_REQUEST';
    assert.strictEqual(requestActionCreator.toString(), expected);
  });

  describe('when the url option is a string', () => {
    test('constructs the url from the named parameters', () => {
      assert.deepEqual(requestAction.payload.url, 'http://localhost:1111/api/1776');
    });
  });

  describe('when the url option is a function', () => {
    test('constructs the url by passing the params into the function', () => {
      const endpointWithUrlFunc = createEndpointWithDefaults({
        url: ({ id }) => `http://localhost:1111/api/${id}`,
        resolver: ({ name }) => name,
      });
      requestAction = endpointWithUrlFunc.actionCreators.makeRequest({ id: 1776 });
      assert.deepEqual(requestAction.payload.url, 'http://localhost:1111/api/1776');
    });
  });

  describe('returns an action object that', () => {

    test('is a plain object', () => {
      assert.isObject(requestAction);
    });

    test('has a type derived from its name property', () => {
      assert.strictEqual(requestAction.type, 'mockApi/MAKE_REQUEST');
    });

    test('has a payload containing the \'params\' passed into the action creator', () => {
      assert.deepEqual(requestAction.meta.params, { id: 1776, foo: 'bar' });
    });

    test('has a meta property containing a derived path', () => {
      assert.strictEqual(requestAction.meta.path, 1776);
    });
  });
});

describe('An endpoint ingest action creator', () => {

  let endpoint, ingestActionCreator, ingestPayload, ingestAction, requestMeta;

  beforeEach(() => {
    endpoint = createEndpointWithDefaults({
      name: 'mock-api',
      url: 'http://localhost:1111/api/:id',
      resolver: ({ id }) => id,
    });

    ingestActionCreator = endpoint.actionCreators.ingest;
    ingestPayload = resourceJson;
    requestMeta = {
      params: { id: 1776 },
      path: 1776,
    };
    ingestAction = ingestActionCreator(ingestPayload, requestMeta);
  });

  test('has a `toString` method which returns the correct action type', () => {
    const expected = 'mockApi/INGEST_RESPONSE';
    assert.strictEqual(ingestActionCreator.toString(), expected);
  });

  describe('returns an object that', () => {

    test('is a plain object', () => {
      assert.isObject(ingestAction);
    });

    test('has a type derived from its name property', () => {
      assert.strictEqual(ingestAction.type, 'mockApi/INGEST_RESPONSE');
    });

  });

  test('returns the data passed to it as its payload', () => {
    assert.deepEqual(ingestAction.payload, ingestPayload);
  });

  test('returns the second argument as its meta property', () => {
    assert.deepEqual(ingestAction.meta, requestMeta);
  });

  test('sets the payload to the error if the payload is an error', () => {
    const error = new Error('Something went wrong with the request');
    const action = ingestActionCreator(error, requestMeta);

    assert.strictEqual(action.payload, error);
  });

  test('sets the error property to true if the payload is an error', () => {
    const action = ingestActionCreator(
      new Error('Something went wrong with the request'),
      requestMeta
    );

    assert.strictEqual(action.error, true);
  });

  test('sets the error property to false if the payload is not an error', () => {
    const ingestAction = endpoint.actionCreators.ingestResponse({});
    assert.strictEqual(ingestAction.error, false);
  });
});
