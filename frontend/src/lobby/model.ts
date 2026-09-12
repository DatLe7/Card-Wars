import type { Lobby } from '.';

export async function joinLobby(id: string): Promise<boolean> {
	const res = await fetch(`/api/v0/lobby/${id}/join`, {
		method: 'POST',
	});
	if (!res.ok) return false;
	return true;
}

export async function getLobbies(): Promise<Lobby[] | null> {
	const res = await fetch('/api/v0/lobby')
	if (!res.ok) return null;
	return res.json();
}
