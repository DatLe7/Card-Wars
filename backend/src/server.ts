import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import { createSocketServer } from './sockets';

const server = app.listen(3012, '0.0.0.0', () => {
  console.log('Server running at http://localhost:3012');
  console.log('Swagger docs: http://localhost:3012/api/v0/docs');
});

createSocketServer(server);
