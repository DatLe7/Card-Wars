import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import type { Lobby } from '../lobby';
import { joinRoom } from './model';
import { socket } from '../socket';

const Room = () => {
	const [lobby, setLobby] = useState<Lobby | undefined>(undefined);
	const [error, setError] = useState<string>();

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

		socket.connect();

		void join();

		return () => {
			socket.disconnect();
		};
	}, [id]);

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
		</>
	);
};

export default Room;
