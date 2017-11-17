import { createEndpoint } from '../context';

const getEndpointDefaults = () => ({
  name: 'resourceApi',
  request: url => (
    new Promise((resolve, reject) => {
      resolve('some_test_data');
    })
  ),
  url: 'http://localhost:1111/api/:id',
});

export const createEndpointWithDefaults = (opts) => createEndpoint(Object.assign(
  getEndpointDefaults(),
  opts,
));

export const getRequestAndIngestActions = (ep, params, payload) => {
  const requestAction = ep.actionCreators.makeRequest(params);
  const ingestAction = ep.actionCreators.ingestResponse(payload, requestAction.meta);
  return [requestAction, ingestAction];
};
