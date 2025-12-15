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
    this.name = UserBodyValidationError.name;
  }
}

export class UserNotFoundError extends Error {
  constructor(message = ERROR_MAP.userIsNotFound) {
    super(message);
    this.name = UserNotFoundError.name;
  }
}
export class RouteNotFoundError extends Error {
  constructor(message = ERROR_MAP.pathIsNotFound) {
    super(message);
    this.name = RouteNotFoundError.name;
  }
}

export class UnexpectedServerError extends Error {
  constructor(message = ERROR_MAP.unexpectedServerError) {
    super(message);
    this.name = RouteNotFoundError.name;
  }
}
