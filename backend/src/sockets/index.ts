import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';

import { socketAuth } from './middleware/socketAuth';
import { registerLobbyHandlers } from './handlers/lobby.handler';

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5174',
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    registerLobbyHandlers(socket);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
}
