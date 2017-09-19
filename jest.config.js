if (typeof global !== 'undefined') {
  const fetch = require('node-fetch').default;
  global.fetch = fetch;
}

const mockFetch = require('fetch-mock');
const resourceJson = require('./test/mock-api/json/resource.json');

mockFetch.get('*', resourceJson);

module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
  ],
};
