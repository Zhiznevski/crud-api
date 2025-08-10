import http from 'node:http';
import 'dotenv/config'
import { generateId, validateId } from './utils/uuid';
import { sendJson } from './utils/sendJson';


const hostname = '127.0.0.1';
const port = Number(process.env.PORT);

const users = [
    {
        id: generateId(),
        username: "Artem",
        age: 28,
        hobbies: [],
    },
    {
        id: generateId(),
        name: "Nadya",
        age: 26,
        hobbies: [],
    }
]

const server = http.createServer((req, res) => {

    const { method, url } = req;

    if (method === "GET") {

        if (url === "/users") {
            sendJson(res, 200, users)
            return;
        }

        if (url?.startsWith("/users/")) { // TODO: need to handle somehow this url check
            const userId = url.split("/").at(-1)
            if (!userId || !validateId(userId)) {
                sendJson(res, 400, { message: 'userId is not valid' }) // TODO: maybe move errors/error messages to separate files and think about general error structure
                return;
            }
            const user = users.find(user => user.id === userId)

            if (!user) {
                sendJson(res, 404, { message: "user is not found" })
                return;
            }

            sendJson(res, 200, user)
        }
    }

    if (method === "POST") {

        if (url === "/users") {
            // TODO: wrap in try/catch block maybe
            const body = [] as Uint8Array[];
            req.on("data", (chunk) => {
                body.push(chunk)
            })

            req.on("end", () => {
                const user = JSON.parse(Buffer.concat(body).toString())
                if (!user || !user.username || !user.age || !user.hobbies) {
                    sendJson(res, 400, { message: "user should have all requered filed (name, age and hobbies)" }) // TODO: handle also types of this parameters
                    return;
                }
                users.push({ id: generateId(), ...user })
                sendJson(res, 201, user)
                return;
            })

        }
    }
    if (method === "PUT") {

    }
    if (method === "DELETE") {
        if (url?.startsWith("/users/")) {
            const userId = url.split("/").at(-1)
            if (!userId || !validateId(userId)) {
                sendJson(res, 400, { message: 'userId is not valid' }) // TODO: duplication
                return;
            }
            const user = users.find(user => user.id === userId)

            if (!user) {
                sendJson(res, 404, { message: "user is not found" })
                return;
            }

            const userIndex = users.findIndex(user => user.id === userId)

            users.splice(userIndex, 1)
            sendJson(res, 204)
            return;

        }
    }
})


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})