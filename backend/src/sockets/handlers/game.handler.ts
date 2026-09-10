import type { Socket } from 'socket.io';

import type { GameStorage } from '../game.storage';
import type { GameActionRequest } from '../types/game';

export function registerGameHandlers(socket: Socket, games: GameStorage): void {
  socket.on(
    'game:action',
    async (request: GameActionRequest) => {
      const game = games.get(request.gameId);
      const room = `lobby:${request.gameId}`;

      if (game === undefined || !socket.rooms.has(room)) {
        return;
      }

      try {
        game.command({ ...request.action, playerId: socket.data.user.id });
      } catch {
        return
      }

      const gameSockets = await socket.nsp.in(room).fetchSockets();

      for (const gameSocket of gameSockets) {
        const playerId = gameSocket.data.user.id;
        gameSocket.emit('game:state', {
          ...game.getPlayerView(playerId),
          actions: game.getAvailableActions(playerId),
        });
      }
    },
  );
}
