import { socket } from '../socket';
import type { Lobby } from '../lobby';

export const joinRoom = async (lobbyId: string): Promise<Lobby> => {
  const response = await socket
    .timeout(5000)
    .emitWithAck('lobby:join', { lobbyId });

  if ('error' in response) {
    throw new Error(response.error);
  }

  return response;
};

export const changeDeck = async (lobbyId: string) => {
	const response = await socket
    .timeout(5000)
    .emitWithAck('lobby:deck-change', { lobbyId });

  return response;
};
