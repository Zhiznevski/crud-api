import http from 'node:http';
import { sendJson } from './utils/sendJson';
import { parseURL } from './utils/parseURL';
import { IUsersRepository } from './userRepository/usersRepository';
import {
  RouteNotFoundError,
  UserBodyValidationError,
  UserIdValidationError,
  UserNotFoundError,
} from './utils/errors';
import { ERROR_MAP } from './consts/consts';

export const server = (
  hostname: string,
  port: number,
  usersRepository: IUsersRepository,
) => {
  const httpServer = http.createServer((req, res) => {
    const handleRequest = async () => {
      try {
        const { method } = req;
        const { pathname: url } = parseURL(req.url ?? '');

        if (method === 'GET') {
          if (url === '/users') {
            const users = await usersRepository.getUsers();
            sendJson(res, 200, users);
            return;
          } else if (url?.startsWith('/users/')) {
            const userId = getUserIdFromURL(url);
            if (!userId) {
              throw new UserIdValidationError();
            }
            sendJson(res, 200, usersRepository.getUserById(userId));
            return;
          } else {
            throw new RouteNotFoundError();
          }
        } else if (method === 'POST') {
          if (url === '/users') {
            const body = [] as Uint8Array[];
            req.on('data', (chunk) => {
              body.push(chunk);
            });
            req.on('end', async () => {
              try {
                const user = JSON.parse(Buffer.concat(body).toString());
                const createdUser = await usersRepository.createUser(user);
                sendJson(res, 201, createdUser);
                return;
              } catch (e) {
                errorHandler(e, res);
              }
            });
            return;
          } else {
            throw new RouteNotFoundError();
          }
        } else if (method === 'PUT') {
          if (url?.startsWith('/users/')) {
            const userId = getUserIdFromURL(url);
            if (!userId) {
              throw new UserIdValidationError();
            }
            const body = [] as Uint8Array[];
            req.on('data', (chunk) => {
              body.push(chunk);
            });
            req.on('end', async () => {
              try {
                const user = JSON.parse(Buffer.concat(body).toString());
                const updatedUser = await usersRepository.updateUser(
                  userId,
                  user,
                );
                sendJson(res, 200, updatedUser);
                return;
              } catch (e) {
                errorHandler(e, res);
              }
            });
            return;
          } else {
            throw new RouteNotFoundError();
          }
        } else if (method === 'DELETE') {
          if (url?.startsWith('/users/')) {
            const userId = getUserIdFromURL(url);
            if (!userId) {
              throw new UserIdValidationError();
            }
            usersRepository.deleteUser(userId);
            sendJson(res, 204);
            return;
          } else {
            throw new RouteNotFoundError();
          }
        } else {
          throw new RouteNotFoundError();
        }
      } catch (e) {
        errorHandler(e, res);
      }
    };

    handleRequest();
  });

  httpServer.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });

  return httpServer;
};

const getUserIdFromURL = (url: string) => url.split('/').at(2);

const errorHandler = (e: unknown, response: http.ServerResponse) => {
  if (
    e instanceof UserIdValidationError ||
    e instanceof UserBodyValidationError
  ) {
    sendJson(response, 400, { message: e.message });
    return;
  }
  if (e instanceof UserNotFoundError || e instanceof RouteNotFoundError) {
    sendJson(response, 404, { message: e.message });
    return;
  }

  sendJson(response, 500, { message: ERROR_MAP.unexpectedServerError });
};
