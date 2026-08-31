export interface Lobby {
  id: string;
	name: string;
	owner: string;
	player: string | null;
}

export type LeaveLobbyResult =
  | {
      kind: 'deleted';
      lobbyId: string;
    }
  | {
      kind: 'updated';
      lobby: Lobby;
    };
