import type { Lobby } from '.';

export async function joinLobby(id: string): Promise<boolean> {
	const res = await fetch(`/api/lobby/${id}`, {
		method: 'POST',
	});
	if (!res.ok) return false;
	return true;
}

export async function getLobbies(): Promise<Lobby[] | null> {
	const res = await fetch('/api/lobby/')
	if (!res.ok) return null;
	return res.json();
}
