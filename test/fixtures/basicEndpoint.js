import { createEndpoint } from '../context';

const basicEndpoint = createEndpoint({
  name: 'mock-api',
  request: url => (
    new Promise((resolve, reject) => {
      resolve({
        someJson: 'test',
      });
    })
  ),
  resolver: id => id,
  url: 'http://localhost:1111/api/:id',
});

export default basicEndpoint;
