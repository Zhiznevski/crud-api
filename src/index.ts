import 'dotenv/config';
import { server } from './server';
import { HOST_NAME } from './consts/consts';
import {
  IUsersRepository,
  usersRepository,
} from './userRepository/usersRepository';

const PORT = Number(process.env.PORT) || 3000;

export const app = (
  hostname: string,
  port: number,
  usersRepository: IUsersRepository,
) => {
  server(hostname, port, usersRepository);
};

app(HOST_NAME, PORT, usersRepository);
