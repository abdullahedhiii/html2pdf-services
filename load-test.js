export const options = {
  scenarios: {
    my_test: {
      executor: 'shared-iterations',
      vus: 200,            
      iterations: 200,    
      maxDuration: '30s', 
    },
  },
};

import http from 'k6/http';

const port = __ENV.PORT
export default function () {
  const res = http.get(`http://localhost:${port}/export`,{
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      url: 'http://example.com',
      type: 'pdf'
    })
  });
  console.log(`Response time: ${res.timings.duration} ms`);
}

