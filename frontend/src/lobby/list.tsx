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
			{error && <div className="mb-4 rounded-[7px] border border-[#d8ae96] bg-[#fae9da] px-3.5 py-3 text-[13px] wrap-anywhere text-[#853a2d]" role="alert">{error}</div>}
			{!error && lobbies === null && <p className="rounded-[9px] border border-dashed border-[#c7c8af] px-5 py-10 text-center text-sm text-[#66705e] [&>h3]:text-[25px] [&>h3]:text-[#24382e] [&>p]:mx-auto [&>p]:mt-3 [&>p]:max-w-[350px]" role="status">Finding your next opponent…</p>}
			{!error && lobbies?.length === 0 && (
				<div className="rounded-[9px] border border-dashed border-[#c7c8af] px-5 py-10 text-center text-sm text-[#66705e] [&>h3]:text-[25px] [&>h3]:text-[#24382e] [&>p]:mx-auto [&>p]:mt-3 [&>p]:max-w-[350px]">
					<span className="mb-2.5 block text-[42px] text-[#6f8155]" aria-hidden="true">♧</span>
					<h3>The table is yours.</h3>
					<p>No open lobbies yet. Create one and invite a friend to play.</p>
				</div>
			)}
			{lobbies?.map((lobby) => (
				<LobbyListItem key={lobby.id} {...lobby} />
			))}
		</div>
	);
};

export default LobbyList;
