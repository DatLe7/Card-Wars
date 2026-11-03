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
		<div className="max-w-full">
			{error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm wrap-anywhere text-red-800" role="alert">{error}</div>}
			<button className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900" onClick={handleCreate}><span className="text-lg leading-none" aria-hidden="true">+</span>Create</button>
		</div>
	);
};

export default LobbyCreate;
