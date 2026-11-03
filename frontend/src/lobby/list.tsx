import { useEffect, useState } from 'react';
import type { LobbySummary } from '.';
import LobbyListItem from './listItem';
import { getLobbies } from './model';

const LobbyList = () => {
	const [lobbies, setLobbies] = useState<LobbySummary[] | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;
		void getLobbies()
			.then((availableLobbies) => {
				/* v8 ignore next */
				if (active) setLobbies(availableLobbies);
			})
			.catch(() => {
				if (active) setError('Failed to load lobbies');
			});

		return () => { active = false; };
	}, []);

	return (
		<div className="grid gap-3" aria-live="polite">
			{error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm wrap-anywhere text-red-800" role="alert">{error}</div>}
			{!error && lobbies === null && <p className="rounded-xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-600" role="status">Finding your next opponent…</p>}
			{!error && lobbies?.length === 0 && (
				<div className="rounded-xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-600">
					<h2 className="text-lg font-semibold text-slate-900">The table is yours.</h2>
					<p className="mx-auto mt-2 max-w-sm">No open lobbies yet. Create one and invite a friend to play.</p>
				</div>
			)}
			{lobbies?.map((lobby) => (
				<LobbyListItem key={lobby.id} {...lobby} />
			))}
		</div>
	);
};

export default LobbyList;
