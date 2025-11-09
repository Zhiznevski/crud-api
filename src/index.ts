import 'dotenv/config';
import { server } from './server';
import { HOST_NAME } from './consts/consts';
import {
  IUsersRepository,
  usersRepository,
} from './userRepository/usersRepository';

export const app = (
  hostname: string,
  port: number,
  usersRepository: IUsersRepository,
) => {
  server(hostname, port, usersRepository);
};

app(HOST_NAME, Number(process.env.PORT), usersRepository);
