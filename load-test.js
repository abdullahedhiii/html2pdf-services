import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    my_test: {
      executor: 'shared-iterations',
      vus:70,
      iterations: 70,
      maxDuration: '30s',
    },
  }
};

const port = __ENV.PORT;

export default function () {
  const urlToConvert = __ENV.URL;

  if (port === '3000') {
    const url = `http://localhost:3000/forms/chromium/convert/url`;

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="url"\r\n\r\n` +
      `${urlToConvert}\r\n` +
      `--${boundary}--\r\n`;

    const headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    };

    const res = http.post(url, body, { headers });

    console.log(`Gotenberg time: ${res.timings.duration} ms`);
    console.log(`Status code: ${res.status}`);
    check(res, {
      'status is 200': (r) => r.status === 200,
    });

  } else {
    const url = `http://localhost:${port}/export`;

    const payload = JSON.stringify({
      url: urlToConvert,
      type: __ENV.TYPE,
    });

    const headers = {
      'Content-Type': 'application/json',
    };

    const res = http.post(url, payload, { headers });

    console.log(`Export service time: ${res.timings.duration} ms`);
    console.log(`Status code: ${res.status}`);
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
  }
}
