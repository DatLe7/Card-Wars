import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Lobby } from '../lobby';
import { changeDeck, joinRoom, leaveRoom, startGame } from './model';
import { socket } from '../socket';
import { UserContext } from '../context/userContext';
import PlayerSeat from './playerSeat';

const Room = () => {
	const navigate = useNavigate();

	const [lobby, setLobby] = useState<Lobby | undefined>(undefined);
	const [error, setError] = useState<string>();

	const user = useContext(UserContext);

	const { id } = useParams();
	useEffect(() => {
		if (!id) return;

		const join = async () => {
			try {
				const joinedLobby = await joinRoom(id);
				setLobby(joinedLobby);
				setError(undefined);
			} catch (error) {
				setLobby(undefined);
				setError((error as Error).message);
			}
		};

		const gameStart = () => {
			navigate('/game');
		};

		socket.connect();

		void join();

		socket.on('lobby:state', setLobby);

		socket.on('game:state', gameStart);

		return () => {
			socket.off('lobby:state', setLobby);
			socket.off('game:state', gameStart);
			socket.disconnect();
		};
	}, [id, navigate]);

	const handleDeckChange = async () => {
		setLobby(await changeDeck(id as string));
	};

	const handleLeave = async () => {
		await leaveRoom(id as string);
		navigate('/');
	};

	const handleStart = async () => {
		await startGame(id as string);
	};

	if (!id) return <p className="mb-4 rounded-[7px] border border-[#d8ae96] bg-[#fae9da] px-3.5 py-3 text-[13px] wrap-anywhere text-[#853a2d]" role="alert">Missing room ID</p>;
	if (error) return <p className="mb-4 rounded-[7px] border border-[#d8ae96] bg-[#fae9da] px-3.5 py-3 text-[13px] wrap-anywhere text-[#853a2d]" role="alert">{error}</p>;
	if (lobby == undefined) return <p className="rounded-[9px] border border-dashed border-[#c7c8af] px-5 py-10 text-center text-sm text-[#66705e] [&>h3]:text-[25px] [&>h3]:text-[#24382e] [&>p]:mx-auto [&>p]:mt-3 [&>p]:max-w-[350px]" role="status">Loading...</p>;

	return (
		<>
			<div className="text-center [&>h1]:text-[clamp(26px,3vw,38px)] [&>h1]:leading-[1.2] [&>h1]:wrap-anywhere [&>p:last-child]:mt-3 [&>p:last-child]:mb-7 [&>p:last-child]:text-[13px] [&>p:last-child]:text-[#66705e]">
				<p className="mb-3 text-[10px] font-extrabold tracking-[2.5px] text-[#6b704f] uppercase">The battle table</p>
				<h1>{lobby.name}</h1>
				<p>Pick your deck. Size up your rival. Let the adventure begin.</p>
			</div>
			<div className="grid grid-cols-[1fr_56px_1fr] items-center max-[480px]:grid-cols-1 max-[480px]:gap-3.5">
				<PlayerSeat player={lobby.owner} label="Owner" number="01" />
				<span className="text-center font-[Georgia,serif] text-[19px] font-bold text-[#8b7949] italic" aria-hidden="true">VS</span>
				<PlayerSeat player={lobby.player} label="Player" number="02" />
			</div>
			<div className="mt-7 flex items-center justify-between gap-3 max-[480px]:flex-wrap">
				<button className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-3 rounded-[7px] border px-6 py-3 text-[13px] leading-[1.4] font-bold transition-[background,transform,box-shadow] duration-150 border-[#d0cbb5] bg-transparent text-[#6d5d49] hover:bg-[#d9dfc9]" type="button" onClick={handleLeave}>Leave</button>
				<div className="flex items-center gap-3 max-[480px]:flex-1 max-[480px]:flex-wrap max-[480px]:justify-end">
					<button className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-3 rounded-[7px] border px-6 py-3 text-[13px] leading-[1.4] font-bold transition-[background,transform,box-shadow] duration-150 border-[#b9c2a5] bg-[#e4e8d5] text-[#35523a] hover:bg-[#d9dfc9]" type="button" onClick={handleDeckChange}>
						<span aria-hidden="true">↔ </span>Toggle deck
					</button>
					{user?.name === lobby.owner.name && (
						<button className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-3 rounded-[7px] border px-6 py-3 text-[13px] leading-[1.4] font-bold transition-[background,transform,box-shadow] duration-150 border-[#244932] bg-[#2f543b] text-[#fff8df] shadow-[0_3px_0_#203b2a] hover:-translate-y-px hover:bg-[#3c6849] active:translate-y-px active:shadow-[0_1px_0_#203b2a]" type="button" onClick={handleStart}>Start<span aria-hidden="true"> →</span></button>
					)}
				</div>
			</div>
			<p className="mt-[26px] border-t border-[#d9d4bd] pt-5 text-center text-[11px] text-[#66705e]">The host starts the game when both challengers are ready.</p>
		</>
	);
};

export default Room;
