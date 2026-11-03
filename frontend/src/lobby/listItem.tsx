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
			className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50"
			type="button"
			aria-label={error || name}
			onClick={() => void handleJoin()}
		>
			<svg className="size-5 shrink-0 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<rect x="4" y="4" width="16" height="16" rx="3" />
				<path d="M4 12h16M12 4v16" />
			</svg>
			<span className="min-w-0 flex-1 text-sm font-medium wrap-anywhere">{error || name}</span>
			<span className="flex shrink-0 items-center gap-2 text-sm font-medium text-emerald-800" aria-hidden="true"><span className="hidden sm:inline">Join</span><span className="text-xl">→</span></span>
		</button>
	);
}

export default LobbyListItem;
