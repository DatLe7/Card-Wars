import type { Socket } from 'socket.io';

import { LobbyService } from '../../lobby/service';
import { HttpError } from '../../errors/httperror';
import type {
  JoinLobbyRequest,
  JoinLobbyResponse,
  LeaveLobbyRequest,
  LeaveLobbyResponse,
} from '../types/lobby';

export function registerLobbyHandlers(socket: Socket): void {
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

        acknowledge({
          error: 'Internal server error',
          status: 500,
        });
      }
    },
  );
}
