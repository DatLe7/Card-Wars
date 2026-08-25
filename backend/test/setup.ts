import {beforeAll, afterAll} from 'vitest';

import * as http from 'http';
import type { AddressInfo } from 'node:net';
import * as db from './db';
import app from '../src/app';
import { createSocketServer } from '../src/sockets';

export let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;
export let socketUrl: string;

let socketServer: ReturnType<typeof createSocketServer>;

beforeAll(async () => {
  server = http.createServer(app);
  socketServer = createSocketServer(server);

  await db.reset();

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address() as AddressInfo;
  socketUrl = `http://localhost:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    socketServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  db.shutdown();
});
