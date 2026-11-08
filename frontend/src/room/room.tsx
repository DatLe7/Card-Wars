import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Lobby } from '../lobby';
import type { GameView } from '../game';
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
		let transferringToGame = false;

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

		const gameStart = (gameView: GameView) => {
			transferringToGame = true;
			navigate('/game', { state: { gameId: id, gameView } });
		};

		socket.connect();

		void join();

		socket.on('lobby:state', setLobby);

		socket.on('game:state', gameStart);

		return () => {
			socket.off('lobby:state', setLobby);
			socket.off('game:state', gameStart);
			if (!transferringToGame) socket.disconnect();
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

	if (!id) return <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm wrap-anywhere text-red-800" role="alert">Missing room ID</p>;
	if (error) return <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm wrap-anywhere text-red-800" role="alert">{error}</p>;
	if (lobby == undefined) return <p className="rounded-xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-600" role="status">Loading...</p>;

	return (
		<>
			<div className="mb-6">
				<h1 className="text-2xl font-semibold tracking-tight wrap-anywhere">{lobby.name}</h1>
				<p className="mt-2 text-sm text-slate-600">Choose your deck and get ready to play.</p>
			</div>
			<div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
				<PlayerSeat player={lobby.owner} label="Owner" number="01" />
				<span className="self-center text-center text-xs font-semibold text-slate-500" aria-hidden="true">VS</span>
				<PlayerSeat player={lobby.player} label="Player" number="02" />
			</div>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
				<button className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100" type="button" onClick={handleLeave}>Leave</button>
				<div className="flex flex-wrap items-center gap-3">
					<button className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200" type="button" onClick={handleDeckChange}>
						<span aria-hidden="true">↔</span>Toggle deck
					</button>
					{user?.name === lobby.owner.name && (
						<button className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900" type="button" onClick={handleStart}>Start<span aria-hidden="true">→</span></button>
					)}
				</div>
			</div>
			<p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">The host starts the game when both challengers are ready.</p>
		</>
	);
};

export default Room;
