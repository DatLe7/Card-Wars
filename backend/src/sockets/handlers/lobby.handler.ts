import type { Socket } from 'socket.io';

import { LobbyService } from '../../lobby/service';
import { HttpError } from '../../errors/httperror';
import type { JoinLobbyRequest, JoinLobbyResponse } from '../types/lobby';

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

        await socket.join(`lobby:${lobby.id}`);
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
}
