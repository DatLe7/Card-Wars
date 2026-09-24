import { useState } from 'react';
import { createLobby } from './model';
import { useNavigate } from 'react-router';

const LobbyCreate = () => {
	const navigate = useNavigate();

	const [error, setError] = useState('');

	const handleCreate = async () => {
		try {
			const lobby = await createLobby();
			navigate(`/room/${lobby.id}`);
		} catch (err) {
			setError((err as Error).message);
		}
	};

	return (
		<div>
			{error && <div role="alert">{error}</div>}
			<button onClick={handleCreate}>Create</button>
		</div>
	);
};

export default LobbyCreate;