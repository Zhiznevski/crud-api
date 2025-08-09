import http from 'node:http';
import 'dotenv/config'


const hostname = '127.0.0.1';
const port = Number(process.env.PORT);


const server = http.createServer((request) => {

    console.log(request)
})

server.listen(port, hostname, () => {
    console.log()
    console.log(`Server running at http://${hostname}:${port}/`);
})