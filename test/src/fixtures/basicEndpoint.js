import { createEndpoint } from '../context';

const basicEndpoint = createEndpoint({
  name: 'mock-api',
  request: url => (
    new Promise((resolve, reject) => {
      fetch(url)
        .then(resp => resp.json())
        .then(json => resolve(json))
        .catch(error => reject(error));
    })
  ),
  resolver: id => id,
  url: 'http://localhost:1111/api/:id',
});

export default basicEndpoint;
