import 'dotenv/config';
import cluster, { Worker } from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import {
  UsersRepository,
  IUsersRepository,
  UserBody,
} from './userRepository/usersRepository';
import {
  UserBodyValidationError,
  UserIdValidationError,
  UserNotFoundError,
} from './utils/errors';
import {
  ACTION_MAP,
  ERROR_MAP,
  ERROR_TYPES_MAP,
  HOST_NAME,
  STATUS_CODES,
} from './consts/consts';
import { server } from './server';
import {
  IpcAction,
  IpcErrorType,
  IpcResponse,
  IpcUsersRepository,
} from './userRepository/ipcRepository';

type IpcRequest = {
  requestId: number;
  action: IpcAction;
  payload?: {
    userId?: string;
    body?: UserBody;
  };
};

const PORT = Number(process.env.PORT);

if (cluster.isPrimary) {
  const cpuCount = availableParallelism();
  const workersCount = Math.max(1, cpuCount - 1);

  const usersRepo: IUsersRepository = new UsersRepository([]);

  const workerPorts: number[] = [];

  for (let i = 0; i < workersCount; i++) {
    const port = PORT + 1 + i;
    workerPorts.push(port);

    cluster.fork({
      ...process.env,
      PORT: String(port),
    });
  }

  let index = 0;

  const balancer = http.createServer((req, res) => {
    const targetPort = workerPorts[index];
    index = (index + 1) % workerPorts.length;

    const proxyReq = http.request(
      {
        host: HOST_NAME,
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(
          proxyRes.statusCode || STATUS_CODES.SERVER_ERROR,
          proxyRes.headers,
        );
        proxyRes.pipe(res);
      },
    );

    req.pipe(proxyReq);

    proxyReq.on('error', () => {
      res.writeHead(500);
      res.end();
    });
  });

  balancer.listen(PORT, HOST_NAME, () => {
    console.log(
      `Balancer starts http://${HOST_NAME}:${PORT} -  ${workerPorts.join(', ')}`,
    );
  });

  cluster.on('message', async (worker: Worker, message: IpcRequest) => {
    const { requestId, action, payload } = message;

    const send = (response: IpcResponse) => {
      worker.send(response);
    };

    const ok = (data?: unknown) => {
      send({ requestId, ok: true, data });
    };

    const err = (errorType: IpcErrorType, message: string) => {
      send({ requestId, ok: false, errorType, message });
    };

    try {
      switch (action) {
        case ACTION_MAP.getUsers: {
          const users = await usersRepo.getUsers();
          return ok(users);
        }
        case ACTION_MAP.getUserById: {
          const userId = payload?.userId ?? '';
          const user = await usersRepo.getUserById(userId);
          return ok(user);
        }
        case ACTION_MAP.createUser: {
          const body = payload?.body as UserBody;
          const created = await usersRepo.createUser(body);
          return ok(created);
        }
        case ACTION_MAP.updateUser: {
          const userId = payload?.userId ?? '';
          const body = payload?.body as UserBody;
          const updated = await usersRepo.updateUser(userId, body);
          return ok(updated);
        }
        case ACTION_MAP.deleteUser: {
          const userId = payload?.userId ?? '';
          await usersRepo.deleteUser(userId);
          return ok(null);
        }
        default: {
          return err(ERROR_TYPES_MAP.UnexpectedServerError, action);
        }
      }
    } catch (e) {
      if (e instanceof UserIdValidationError) {
        return err(ERROR_TYPES_MAP.UserIdValidationError, e.message);
      }
      if (e instanceof UserBodyValidationError) {
        return err(ERROR_TYPES_MAP.UserBodyValidationError, e.message);
      }
      if (e instanceof UserNotFoundError) {
        return err(ERROR_TYPES_MAP.UserNotFoundError, e.message);
      }

      console.error(e);
      return err(
        ERROR_TYPES_MAP.UnexpectedServerError,
        ERROR_MAP.unexpectedServerError,
      );
    }
  });
} else {
  const port = Number(process.env.PORT);
  const repo = new IpcUsersRepository();

  server(HOST_NAME, port, repo);
}
