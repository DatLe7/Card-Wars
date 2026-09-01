import type { Lobby } from '../../lobby';

export interface JoinLobbyRequest {
  lobbyId: string;
}

export type JoinLobbyResponse = Lobby | {
  error: string;
  status: number;
};

export interface LeaveLobbyRequest {
  lobbyId: string;
}

export type LeaveLobbyResponse = {
  lobbyId: string;
} | {
  error: string;
  status: number;
};

export interface ChangeDeckRequest {
  lobbyId: string;
}

export type ChangeDeckResponse = Lobby | {
  error: string;
  status: number;
};
