import { utils } from './context';

describe('utils', function() {

  context('#camelCase', function() {

    let str;

    beforeEach(function() {
      str = 'mock-api';
    });

    it ('transforms spinal to camel case', function() {
      expect(utils.camelCase(str)).toBe('mockApi');
    });

  });

  context('#actionTypeCase', function() {

    let str;

    beforeEach(function() {
      str = 'mock-api';
    });

    it ('transforms spinal to camel case', function() {
      expect(utils.actionTypeCase(str)).toBe('MOCK_API');
    });

  });

  context('#initialEndpointState', function() {

    let state;

    beforeEach(function() {
      state = utils.initialEndpointState();
    });

    it('returns an object with the proper format', function() {
      const expected = {
        data: null,
        error: null,
        pendingRequests: 0,
        successfulRequests: 0,
        totalRequests: 0,
      };
      expect(state).toEqual(expected);
    });

  });

});

