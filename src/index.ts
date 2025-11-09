import 'dotenv/config';
import { server } from './server';
import { HOST_NAME } from './consts/consts';
import { User, users } from './db/users';

export const app = (hostname: string, port: number, users: User[]) => {
  server(hostname, port, users);
};

app(HOST_NAME, Number(process.env.PORT), users);
