export async function joinLobby(id: string): Promise<boolean> {
	const res = await fetch(`/api/lobbies/${id}`, {
		method: 'POST',
	});
	if (!res.ok) return false;
	return true;
}
