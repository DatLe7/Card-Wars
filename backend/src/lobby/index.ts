export interface LobbyUser {
  name: string | null;
  deck: string;
}

export interface Lobby {
  id: string;
	name: string;
	owner: LobbyUser;
	player: LobbyUser;
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
