import type { Socket } from 'socket.io';

import { LobbyService } from '../../lobby/service';
import { HttpError } from '../../errors/httperror';
import type {
  ChangeDeckRequest,
  ChangeDeckResponse,
  JoinLobbyRequest,
  JoinLobbyResponse,
  LeaveLobbyRequest,
  LeaveLobbyResponse,
  StartLobbyRequest,
  StartLobbyResponse,
} from '../types/lobby';
import type { GameStorage } from '../game.storage';

export function registerLobbyHandlers(
  socket: Socket,
  games: GameStorage,
): void {
  socket.on(
    'lobby:start',
    async (
      request: StartLobbyRequest,
      acknowledge?: (response: StartLobbyResponse) => void,
    ) => {
      try {
        const input = await new LobbyService().start(
          request.lobbyId,
          socket.data.user,
        );
        const game = games.create(input);
        const room = `lobby:${request.lobbyId}`;
        const lobbySockets = await socket.nsp.in(room).fetchSockets();

        for (const lobbySocket of lobbySockets) {
          const view = game.getPlayerView(lobbySocket.data.user.id);
          lobbySocket.emit('game:state', view);
        }

        acknowledge?.({ gameId: input.gameId });
      } catch (error) {
        if (error instanceof HttpError) {
          acknowledge?.({
            error: error.message,
            status: error.status,
          });
          return;
        }

        acknowledge?.({
          error: 'Internal server error',
          status: 500,
        });
      }
    },
  );

  socket.on(
    'lobby:deck-change',
    async (
      request: ChangeDeckRequest,
      acknowledge: (response: ChangeDeckResponse) => void,
    ) => {
      const lobby = await new LobbyService().changeDeck(
        request.lobbyId,
        socket.data.user,
      );
      const room = `lobby:${request.lobbyId}`;

      socket.nsp.to(room).emit('lobby:state', lobby);
      acknowledge(lobby);
    },
  );

  socket.on(
    'lobby:join',
    async (
      request: JoinLobbyRequest,
      acknowledge: (response: JoinLobbyResponse) => void,
    ) => {
      try {
        const lobby = await new LobbyService().getForUser(
          request.lobbyId,
          socket.data.user,
        );

        const room = `lobby:${lobby.id}`;

        await socket.join(room);
        socket.to(room).emit('lobby:state', lobby);
        acknowledge(lobby);
      } catch (error) {
        if (error instanceof HttpError) {
          acknowledge({
            error: error.message,
            status: error.status,
          });
          return;
        }

        acknowledge({
          error: 'Internal server error',
          status: 500,
        });
      }
    },
  );

  socket.on(
    'lobby:leave',
    async (
      request: LeaveLobbyRequest,
      acknowledge: (response: LeaveLobbyResponse) => void,
    ) => {
      try {
        const result = await new LobbyService().leave(
          request.lobbyId,
          socket.data.user,
        );
        const room = `lobby:${request.lobbyId}`;

        if (result.kind === 'deleted') {
          socket.to(room).emit('lobby:closed', {
            lobbyId: result.lobbyId,
          });
          await socket.nsp.in(room).socketsLeave(room);
        } else {
          socket.to(room).emit('lobby:state', result.lobby);
          await socket.leave(room);
        }

        acknowledge({ lobbyId: request.lobbyId });
      } catch (error) {
        if (error instanceof HttpError) {
          acknowledge({
            error: error.message,
            status: error.status,
          });
          return;
        }
        /* v8 ignore next */
        acknowledge({
          error: 'Internal server error',
          status: 500,
        });
      }
    },
  );
}
