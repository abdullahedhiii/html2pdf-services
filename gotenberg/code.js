import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const form = new FormData();
form.append('url', 'https://example.com');

const response = await axios.post(
  'http://localhost:3000/forms/chromium/convert/url',
  form,
  {
    headers: form.getHeaders(),
    responseType: 'arraybuffer'
  }
);

fs.writeFileSync('output.pdf', response.data);
console.log('PDF downloaded!');
