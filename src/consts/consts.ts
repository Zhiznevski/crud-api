export const HOST_NAME = '127.0.0.1';

export const ERROR_MAP = {
  invalidUserId: 'UserId is not valid',
  invalidUserBody:
    'User should have all requered fields (name, age and hobbies) with valid types',
  userIsNotFound: 'User is not found',
  pathIsNotFound: 'Path is not found',
  unexpectedServerError: 'Unexpected server error. Please try again',
};

export const ERROR_TYPES_MAP = {
  UserIdValidationError: 'UserIdValidationError',
  UserBodyValidationError: 'UserBodyValidationError',
  UserNotFoundError: 'UserNotFoundError',
  UnexpectedServerError: 'UnexpectedServerError',
} as const;

export const ACTION_MAP = {
  getUsers: 'getUsers',
  getUserById: 'getUserById',
  createUser: 'createUser',
  updateUser: 'updateUser',
  deleteUser: 'deleteUser',
} as const;
