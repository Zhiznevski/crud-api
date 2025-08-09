import http from 'node:http';
const server = http.createServer((request, response) => {
  console.log('hello');
});
