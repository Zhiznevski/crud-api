import { ERROR_MAP } from '../consts/consts';

export class UserIdValidationError extends Error {
  constructor(message = ERROR_MAP.invalidUserId) {
    super(message);
    this.name = UserIdValidationError.name;
  }
}

export class UserBodyValidationError extends Error {
  constructor(message = ERROR_MAP.invalidUserBody) {
    super(message);
    this.name = UserIdValidationError.name;
  }
}

export class UserNotFoundError extends Error {
  constructor(message = ERROR_MAP.userIsNotFound) {
    super(message);
    this.name = UserNotFoundError.name;
  }
}
