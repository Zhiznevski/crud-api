import { ACTION_MAP, ERROR_MAP, ERROR_TYPES_MAP } from '../consts/consts';
import {
  UserBodyValidationError,
  UserIdValidationError,
  UserNotFoundError,
} from '../utils/errors';
import { IUsersRepository, User, UserBody } from './usersRepository';

export type IpcAction =
  | 'getUsers'
  | 'getUserById'
  | 'createUser'
  | 'updateUser'
  | 'deleteUser';

export type IpcErrorType = keyof typeof ERROR_TYPES_MAP;

export type IpcResponseOk = {
  requestId: number;
  ok: true;
  data?: unknown;
};

export type IpcResponseError = {
  requestId: number;
  ok: false;
  errorType: IpcErrorType;
  message: string;
};

export type IpcResponse = IpcResponseOk | IpcResponseError;

type Pending = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

const pending = new Map<number, Pending>();
let nextId = 1;

const mapError = (res: IpcResponseError): Error => {
  const { errorType, message } = res;

  if (errorType === 'UserIdValidationError') {
    return new UserIdValidationError(message);
  }
  if (errorType === 'UserBodyValidationError') {
    return new UserBodyValidationError(message);
  }
  if (errorType === 'UserNotFoundError') {
    return new UserNotFoundError(message);
  }
  return new Error(message || ERROR_MAP.unexpectedServerError);
};

process.on('message', (message: unknown) => {
  const res = message as IpcResponse;

  const entry = pending.get(res.requestId);
  if (!entry) return;

  pending.delete(res.requestId);

  if (res.ok) {
    entry.resolve(res.data);
  } else {
    entry.reject(mapError(res));
  }
});

const send = (action: IpcAction, payload?: object): Promise<unknown> => {
  const requestId = nextId++;

  const message = {
    requestId,
    action,
    payload,
  };

  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    process.send?.(message);
  });
};

export class IpcUsersRepository implements IUsersRepository {
  async getUsers(): Promise<User[]> {
    const data = await send(ACTION_MAP.getUsers);
    return data as User[];
  }

  async getUserById(userId: string): Promise<User> {
    const data = await send(ACTION_MAP.getUserById, { userId });
    return data as User;
  }

  async createUser(body: UserBody): Promise<User> {
    const data = await send(ACTION_MAP.createUser, { body });
    return data as User;
  }

  async updateUser(userId: string, body: UserBody): Promise<User> {
    const data = await send(ACTION_MAP.updateUser, { userId, body });
    return data as User;
  }

  async deleteUser(userId: string): Promise<void> {
    await send(ACTION_MAP.deleteUser, { userId });
  }
}
