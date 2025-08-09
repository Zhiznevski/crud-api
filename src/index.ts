import http from 'node:http';
import 'dotenv/config'


const hostname = '127.0.0.1';
const port = Number(process.env.PORT);


const users = [
    {
        id: '1',
        name: "Artem",
        surname: "Zhiznevskiy"
    },
    {
        id: '2',
        name: "Nadya",
        surname: "Zhiznevskaya"
    }
]
const server = http.createServer((req, res) => {

    const { method, url } = req;

    if (method === "GET") {
        if (url === "/users") {
            console.log(url)
            res.statusCode = 200;
            res.writeHead(200, { "Content-Type": "text/html" })
            res.end(JSON.stringify(users))
        }

        if (url?.startsWith("/users/")) {
            console.log(url)
            const userId = url.split("/").at(-1)
            const user = users.find(user => user.id === userId)
            if (!userId || !user) return;
            res.statusCode = 200;
            res.writeHead(200, { "Content-Type": "text/html" })
            res.end(JSON.stringify(user))
        }
    }

    if (method === "POST") {

    }

})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})