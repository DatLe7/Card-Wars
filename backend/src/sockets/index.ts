import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';

import { socketAuth } from './middleware/socketAuth';

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5174',
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log('user connected')
    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });

  return io;
}
