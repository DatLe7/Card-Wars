import { useState } from 'react';
import { useNavigate } from 'react-router';

import { joinLobby } from './model';
import type { LobbySummary } from '.';

function LobbyListItem({ name, id }: LobbySummary) {
	const navigate = useNavigate();

	const [error, setError] = useState('');

	async function handleJoin() {
		setError('');
		try {
			const joined = await joinLobby(id);
			navigate(`/room/${joined}`);
		} catch (err) {
			setError((err as Error).message);
		}
	}

	return (
		<button
			type="button"
			onClick={() => void handleJoin()}
		>
			{error || name}
		</button>
	);
}

export default LobbyListItem;
