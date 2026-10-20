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
			className="flex w-full cursor-pointer items-center gap-[18px] rounded-[9px] border border-[#d9d4be] bg-white/45 px-5 py-[18px] text-left text-[#24382e] transition-[background,border-color,transform] duration-150 hover:translate-x-[3px] hover:border-[#a3b095] hover:bg-[#fffdf2] max-[480px]:flex-wrap max-[480px]:gap-3 max-[480px]:p-[15px]"
			type="button"
			aria-label={error || name}
			onClick={() => void handleJoin()}
		>
			<span className="grid h-[50px] basis-11 shrink-0 grow-0 place-items-center rounded-md border border-[#c6cbb3] bg-[#e5e9d7] text-2xl text-[#526b43]" aria-hidden="true">✦</span>
			<span className="grid min-w-0 gap-1 max-[480px]:flex-1">
				<span className="text-[15px] font-bold wrap-anywhere">{error || name}</span>
				<span className="text-[11px] text-[#66705e] max-[480px]:hidden" aria-hidden="true">A little friendly competition</span>
			</span>
			<span className="ml-auto flex shrink-0 items-center gap-5 text-xs font-bold text-[#4c6744] [&>span]:text-[22px] max-[480px]:w-full max-[480px]:justify-end max-[480px]:gap-3.5" aria-hidden="true">Join lobby <span>→</span></span>
		</button>
	);
}

export default LobbyListItem;
