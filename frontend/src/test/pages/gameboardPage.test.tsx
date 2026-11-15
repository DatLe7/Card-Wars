import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserContext } from '@/context/userContext';
import type { SessionUser } from '@/auth';
import { mockSocket } from '../../../vitest.setup';
import { sampleGameView } from '../testutils';
import { Lobby } from '../../lobby';
import GamePage from '../../pages/game';
import Room from '../../room/room';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual<typeof import('react-router')>('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

const user: SessionUser = { id: 'player-1', name: 'Dat' };

const lobby: Lobby = {
	id: 'room-123',
	name: 'Dat\'s Lobby',
	owner: { name: 'Dat', deck: 'finn' },
	player: { name: 'Jake', deck: 'jake' },
};

function renderLobbyRoom() {
	mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
	return render(
		<MemoryRouter initialEntries={['/room/room-123']}>
			<Routes>
				<Route
					path="/room/:id"
					element={
						<UserContext.Provider value={user}>
							<Room />
						</UserContext.Provider>
					}
				/>
			</Routes>
		</MemoryRouter>,
	);
}

describe('gameboard websocket entry', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});

	it('connects the room socket', async () => {
		renderLobbyRoom();
		await screen.findByText(lobby.name);

		expect(mockSocket.connect).toHaveBeenCalledOnce();
	});

	it('joins the lobby over the room socket', async () => {
		renderLobbyRoom();
		await screen.findByText(lobby.name);

		expect(mockSocket.emitWithAck).toHaveBeenCalledWith('lobby:join', { lobbyId: lobby.id });
	});

	it('navigates to the gameboard with the initial game state', async () => {
		renderLobbyRoom();
		await screen.findByText(lobby.name);

		const onGameState = mockSocket.on.mock.calls.find(
			([event]) => event === 'game:state',
		)?.[1] as ((view: ReturnType<typeof sampleGameView>) => void) | undefined;

		if (!onGameState) throw new Error('Room did not subscribe to game:state');
		await act(async () => {
			onGameState(sampleGameView(user));
		});

		expect(mockNavigate).toHaveBeenCalledWith('/game', {
			state: { gameId: lobby.id, gameView: sampleGameView(user) },
		});
	});

	it('renders GamePage with the state handed off from the room', () => {
		const gameView = sampleGameView(user);

		render(
			<MemoryRouter initialEntries={[{
				pathname: '/game',
				state: { gameId: lobby.id, gameView },
			}]}>
				<Routes>
					<Route path="/game" element={<GamePage />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByRole('heading', { name: 'Game board' })).toBeInTheDocument();
	});
});
