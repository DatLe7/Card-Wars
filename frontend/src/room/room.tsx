import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { Lobby } from '../lobby';
import { changeDeck, joinRoom, leaveRoom, startGame } from './model';
import { socket } from '../socket';
import { UserContext } from '../context/userContext';

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

	if (!id) return <p role="alert">Missing room ID</p>;
	if (error) return <p role="alert">{error}</p>;
	if (lobby == undefined) return <p>Loading...</p>;

	return (
		<>
			<h1>{lobby.name}</h1>
			<dl>
				<dt>Owner name</dt>
				<dd aria-label="Owner name">{lobby.owner.name}</dd>
				<dt>Owner deck</dt>
				<dd aria-label="Owner deck">{lobby.owner.deck}</dd>
			</dl>
			<dl>
				<dt>Player name</dt>
				<dd aria-label="Player name">{lobby.player.name ?? 'missing'}</dd>
				<dt>Player deck</dt>
				<dd aria-label="Player deck">{lobby.player.deck}</dd>
			</dl>
			<button type="button" onClick={handleDeckChange}>
				Toggle deck
			</button>
			<button type="button" onClick={handleLeave}>
				Leave
			</button>
			{user?.name === lobby.owner.name && (
				<button type="button" onClick={handleStart}>Start</button>
			)}
		</>
	);
};

export default Room;
