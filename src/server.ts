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
import { ERROR_MAP, ROUTES, STATUS_CODES } from './consts/consts';

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

        if (method === 'GET' && url === ROUTES.users) {
          const users = await usersRepository.getUsers();
          sendJson(res, STATUS_CODES.OK, users);
          return;
        }

        if (method === 'GET' && url?.startsWith(ROUTES.users + '/')) {
          const userId = getUserIdFromURL(url);
          if (!userId) {
            throw new UserIdValidationError();
          }
          const user = await usersRepository.getUserById(userId);
          sendJson(res, STATUS_CODES.OK, user);
          return;
        }

        if (method === 'POST' && url === ROUTES.users) {
          const body = [] as Uint8Array[];
          req.on('data', (chunk) => {
            body.push(chunk);
          });
          req.on('end', async () => {
            try {
              const user = JSON.parse(Buffer.concat(body).toString());
              const createdUser = await usersRepository.createUser(user);
              sendJson(res, STATUS_CODES.CREATED, createdUser);
              return;
            } catch (e) {
              errorHandler(e, res);
            }
          });
          return;
        }

        if (method === 'PUT' && url?.startsWith(ROUTES.users + '/')) {
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
              sendJson(res, STATUS_CODES.OK, updatedUser);
              return;
            } catch (e) {
              errorHandler(e, res);
            }
          });
          return;
        }

        if (method === 'DELETE' && url?.startsWith(ROUTES.users + '/')) {
          const userId = getUserIdFromURL(url);
          if (!userId) {
            throw new UserIdValidationError();
          }
          await usersRepository.deleteUser(userId);
          sendJson(res, STATUS_CODES.NO_CONTENT);
          return;
        }

        throw new RouteNotFoundError();
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
    sendJson(response, STATUS_CODES.BAD_REQUEST, { message: e.message });
    return;
  }
  if (e instanceof UserNotFoundError || e instanceof RouteNotFoundError) {
    sendJson(response, STATUS_CODES.NOT_FOUND, { message: e.message });
    return;
  }

  sendJson(response, STATUS_CODES.SERVER_ERROR, {
    message: ERROR_MAP.unexpectedServerError,
  });
};
