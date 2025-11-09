import http from 'node:http';
import { generateId, validateId } from './utils/uuid';
import { sendJson } from './utils/sendJson';
import { parseURL } from './utils/parseURL';
import { User } from './userRepository/users';

export const server = (hostname: string, port: number, users: User[]) => {
  http
    .createServer((req, res) => {
      try {
        const { method } = req;
        const { pathname: url } = parseURL(req.url ?? '');

        if (method === 'GET') {
          if (url === '/users') {
            sendJson(res, 200, users);

            return;
          } else if (url?.startsWith('/users/')) {
            // TODO: need to handle somehow this url check
            const userId = url.split('/').at(2);
            if (!userId || !validateId(userId)) {
              sendJson(res, 400, { message: 'userId is not valid' }); // TODO: maybe move errors/error messages to separate files and think about general error structure
              return;
            }
            const user = users.find((user) => user.id === userId);

            if (!user) {
              sendJson(res, 404, { message: 'user is not found' });
              return;
            }

            sendJson(res, 200, user);
          } else {
            sendJson(res, 404, { message: 'Not found' });
          }
        } else if (method === 'POST') {
          if (url === '/users') {
            // TODO: wrap in try/catch block maybe
            const body = [] as Uint8Array[];
            req.on('data', (chunk) => {
              body.push(chunk);
            });

            req.on('end', () => {
              const user = JSON.parse(Buffer.concat(body).toString());
              if (!user || !user.username || !user.age || !user.hobbies) {
                sendJson(res, 400, {
                  message:
                    'user should have all requered fields (name, age and hobbies)',
                }); // TODO: handle also types of this parameters
                return;
              }
              users.push({ id: generateId(), ...user });
              sendJson(res, 201, user);
              return;
            });
          } else {
            sendJson(res, 404, { message: 'Not found' });
          }
        } else if (method === 'PUT') {
          if (url?.startsWith('/users/')) {
            const userId = url.split('/').at(2);
            if (!userId || !validateId(userId)) {
              sendJson(res, 400, { message: 'userId is not valid' }); // TODO: duplication
              return;
            }

            const initialUser = users.find((user) => user.id === userId);

            if (!initialUser) {
              sendJson(res, 404, { message: 'user is not found' });
              return;
            }

            const body = [] as Uint8Array[];
            req.on('data', (chunk) => {
              body.push(chunk);
            });

            req.on('end', () => {
              const user = JSON.parse(Buffer.concat(body).toString());
              if (!user || !user.username || !user.age || !user.hobbies) {
                sendJson(res, 400, {
                  message:
                    'user should have all requered fields (name, age and hobbies)',
                }); // TODO: handle also types of this parameters
                return;
              }
              users.splice(
                users.findIndex((u) => u.id === initialUser.id),
                1,
                { id: generateId(), ...user },
              );
              sendJson(res, 200, user);
              return;
            });
          }
        } else if (method === 'DELETE') {
          if (url?.startsWith('/users/')) {
            const userId = url.split('/').at(2);
            if (!userId || !validateId(userId)) {
              sendJson(res, 400, { message: 'userId is not valid' }); // TODO: duplication
              return;
            }
            const initialUser = users.find((user) => user.id === userId);

            if (!initialUser) {
              sendJson(res, 404, { message: 'user is not found' });
              return;
            }

            const userIndex = users.findIndex((user) => user.id === userId);

            users.splice(userIndex, 1);
            sendJson(res, 204);
            return;
          } else {
            sendJson(res, 404, { message: 'Not found' });
          }
        } else {
          sendJson(res, 404, { message: 'Not found' });
        }
      } catch (e) {
        console.error(e);
        sendJson(res, 500, { message: 'Server error' });
      }
    })
    .listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
};
