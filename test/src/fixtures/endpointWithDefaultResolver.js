import { createEndpoint } from '../context';

const ep = createEndpoint({
  name: 'mock-api',
  request: url => (
    new Promise((resolve, reject) => {
      fetch(url)
        .then(resp => resp.json())
        .then(json => resolve(json))
    })
  ),
  url: 'http://localhost:1111/api/:id',
});

export default ep;
