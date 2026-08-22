import {beforeAll, afterAll} from 'vitest';

import * as http from 'http';
import * as db from './db';
import app from '../src/app';

export let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

beforeAll(async () => {
	server = http.createServer(app);
	server.listen();
	return db.reset();
});

afterAll(() => {
	db.shutdown();
	server.close();
});