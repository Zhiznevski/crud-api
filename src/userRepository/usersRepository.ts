import {
  UserBodyValidationError,
  UserIdValidationError,
  UserNotFoundError,
} from '../utils/errors';
import { generateId, validateId } from '../utils/uuid';
import { users } from './users';

const isUsersBodyValid = (body: UserBody) => {
  if (!body) return false;
  if (typeof body.username !== 'string' || body.username.trim() === '') {
    return false;
  }
  if (
    typeof body.age !== 'number' ||
    !Number.isInteger(body.age) ||
    body.age < 0
  ) {
    return false;
  }
  if (!Array.isArray(body.hobbies)) return false;
  return true;
};

export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

export type UserBody = Omit<User, 'id'>;

export interface IUsersRepository {
  getUsers(): User[];
  getUserById(userId: string): User;
  createUser(body: UserBody): User;
  updateUser(userId: string, body: UserBody): User;
  deleteUser(userId: string): void;
}

class UsersRepository implements IUsersRepository {
  users: User[];
  constructor(users: User[]) {
    this.users = users;
  }

  getUserById(userId: string) {
    if (!validateId(userId)) {
      throw new UserIdValidationError();
    }
    const user = this.users.find((user) => user.id === userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }

  getUsers() {
    return this.users;
  }

  deleteUser(userId: string) {
    this.getUserById(userId);
    const userIndex = this.users.findIndex((user) => user.id === userId);
    this.users.splice(userIndex, 1);
  }

  createUser(userBody: UserBody) {
    if (!isUsersBodyValid(userBody)) {
      throw new UserBodyValidationError();
    }

    const createdUser = { id: generateId(), ...userBody };
    this.users.push(createdUser);
    return createdUser;
  }

  updateUser(userId: string, userBody: UserBody) {
    const user = this.getUserById(userId);
    const userIndex = this.users.findIndex((user) => user.id === userId);

    if (!isUsersBodyValid(userBody)) {
      console.log('Невалидно');
      throw new UserBodyValidationError();
    }

    const updatedUser = { ...user, ...userBody };
    this.users.splice(userIndex, 1, updatedUser);
    return updatedUser;
  }
}

export const usersRepository = new UsersRepository(users);
