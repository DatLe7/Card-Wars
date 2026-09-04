import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'node:http';

import { socketAuth } from './middleware/socketAuth';
import { registerLobbyHandlers } from './handlers/lobby.handler';
import { GameStorage } from './game.storage';

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5174',
      credentials: true,
    },
  });
  const games = new GameStorage();

  io.use(socketAuth);

  io.on('connection', (socket) => {
    registerLobbyHandlers(socket, games);
  });

  return io;
}
