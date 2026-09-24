export interface LobbySummary {
  id: string;
  name: string;
}

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