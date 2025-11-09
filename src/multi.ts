import 'dotenv/config';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import process from 'node:process';

import { HOST_NAME } from './consts/consts';
import { server } from './server';
import { users } from './db/users';

const numCPUs = availableParallelism() - 1;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({
      ...process.env,
      PORT: String(Number(process.env.PORT) + i),
    });
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  server(HOST_NAME, Number(process.env.PORT), users);
  console.log(`Worker ${process.pid} started`);
}
