import type { Lobby } from '../../lobby';

export interface JoinLobbyRequest {
  lobbyId: string;
}

export type JoinLobbyResponse = Lobby | {
  error: string;
  status: number;
};
