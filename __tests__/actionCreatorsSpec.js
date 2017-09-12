import resourceJson from '../mock-api/json/resource.json';

import { basicEndpoint } from './fixtures';

describe('An endpoint request action creator', function() {

  let requestActionCreator, requestAction;

  beforeEach(function() {
    requestActionCreator = basicEndpoint.actionCreators.request;
    requestAction = basicEndpoint.actionCreators.request(1776, { foo: 'bar' });
  });

  it('is a function', function() {
    expect(typeof requestActionCreator).toBe('function');
  });

  it('has a `toString` method which returns the correct action type', function() {
    const expected = 'mockApi/MAKE_MOCK_API_REQUEST';
    expect(requestActionCreator.toString()).toBe(expected);
  });

  context('returns an action object that', function() {

    it('is a plain object', function() {
      expect(typeof requestAction).toBe('object');
    });

    it('has a type derived from its name property', function() {
      expect(requestAction.type).toBe('mockApi/MAKE_MOCK_API_REQUEST');
    });

    it('has a payload containing the url', function() {
      expect(requestAction.payload.url).toEqual('http://localhost:1111/api/1776');
    });

    it('has a payload containing the options passed as the last parameter', function() {
      expect(requestAction.payload.options).toEqual({ foo: 'bar' });
    });

    it('defaults the options key of the payload to an empty object', function() {
      requestAction = basicEndpoint.actionCreators.request(1776);
      expect(requestAction.payload.options).toEqual({});
    });

    it('has a meta property containing the named parameters', function() {
      expect(requestAction.meta.params).toEqual({ id: 1776 });
    });

    it('has a meta property containing a derived path', function() {
      expect(requestAction.meta.path).toBe(1776);
    });

  });

});

describe('An endpoint ingest action creator', function() {

  let ingestActionCreator, ingestPayload, ingestAction, requestMeta;

  beforeEach(function() {
    ingestActionCreator = basicEndpoint.actionCreators.ingest;
    ingestPayload = resourceJson;
    requestMeta = {
      params: { id: 1776 },
      path: 1776,
    };
    ingestAction = ingestActionCreator(ingestPayload, requestMeta);
  });

  it('has a `toString` method which returns the correct action type', function() {
    const expected = 'mockApi/INGEST_MOCK_API_RESPONSE';
    expect(ingestActionCreator.toString()).toBe(expected);
  });

  context('returns an object that', function() {

    it('is a plain object', function() {
      expect(typeof ingestAction).toBe('object');
    });

    it('has a type derived from its name property', function() {
      expect(ingestAction.type).toBe('mockApi/INGEST_MOCK_API_RESPONSE');
    });

  });

  it('returns the data passed to it as its payload', function() {
    expect(ingestAction.payload).toEqual(ingestPayload);
  });

  it('returns the second argument as its meta property', function() {
    expect(ingestAction.meta).toEqual(requestMeta);
  });

  it('sets the payload to the error if the payload is an error', function() {
    const error = new Error('Something went wrong with the request');
    const action = ingestActionCreator(error, requestMeta);

    expect(action.payload).toBe(error);
  });

  it('sets the error property to true if the payload is an error', function() {
    const action = ingestActionCreator(
      new Error('Something went wrong with the request'),
      requestMeta
    );

    expect(action.error).toBe(true);
  });

  it('sets the error property to false if the payload is not an error', function() {
    expect(ingestAction.error).toBe(false);
  });

});
