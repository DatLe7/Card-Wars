import type { Lobby } from '.';

export async function joinLobby(id: string): Promise<string> {
	const res = await fetch(`/api/v0/lobby/${id}/join`, {
		method: 'POST',
	});
	if (!res.ok) throw Error('Failed to join lobby');
	return id;
}

export async function getLobbies(): Promise<Lobby[]> {
	const res = await fetch('/api/v0/lobby')
	if (!res.ok) throw new Error('Failed to load lobbies');
	return res.json();
}

export async function createLobby(): Promise<Lobby> {
	const res = await fetch('/api/v0/lobby', {
		method: 'POST',
	});
	if (!res.ok) throw Error('Failed to create lobby');
	return res.json();
}