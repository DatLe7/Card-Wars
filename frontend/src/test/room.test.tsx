import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { mockSocket } from '../../vitest.setup';

import Room from '../room/room';
import type { Lobby } from '../lobby';

const lobby: Lobby = {
	id: '123',
	name: 'Dat\'s Lobby',
	owner: { name: 'Dat', deck: 'finn' },
	player: { name: null, deck: 'finn' },
};

const renderRoom = () => render(
	<MemoryRouter initialEntries={['/room/123']}>
		<Routes>
			<Route path='/room/:id' element={<Room />} />
		</Routes>
	</MemoryRouter>
);

describe('Room', () => {
	it('renders lobby name', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByText('Dat\'s Lobby')).toBeInTheDocument();
	});

	it('renders owner name and deck', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByLabelText('Owner name')).toHaveTextContent(lobby.owner.name as string);
		expect(screen.getByLabelText('Owner deck')).toHaveTextContent(lobby.owner.deck);
	});

	it('renders player name as missing and deck as finn', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByLabelText('Player name')).toHaveTextContent('missing');
		expect(screen.getByLabelText('Player deck')).toHaveTextContent('finn');
	});

	it('shows loading until the lobby is loaded', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(screen.getByText('Loading...')).toBeInTheDocument();
		expect(await screen.findByText(lobby.name)).toBeInTheDocument();
		expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
	});

	it('displays a lobby join error returned by the server', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce({
			error: 'Lobby Not Found',
			status: 404,
		});
		renderRoom();

		expect(await screen.findByRole('alert')).toHaveTextContent('Lobby Not Found');
	});

	it('connects when mounted and disconnects when unmounted', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		const { unmount } = renderRoom();

		await screen.findByText('Dat\'s Lobby');
		expect(mockSocket.connect).toHaveBeenCalledOnce();
		expect(mockSocket.disconnect).not.toHaveBeenCalled();

		unmount();

		expect(mockSocket.disconnect).toHaveBeenCalledOnce();
	});

	it('shows Missing room ID when no id in path', () => {
		render(
			<MemoryRouter initialEntries={['/room']}>
				<Routes>
					<Route path='/room' element={<Room />} />
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByRole('alert')).toHaveTextContent('Missing room ID');
	});
	it('view updates on new lobby:state', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		await screen.findByText(lobby.name);

		const updatedLobby: Lobby = {
			...lobby,
			player: { name: 'Jake', deck: 'finn' },
		};

		const onLobbyState = mockSocket.on.mock.calls.find(
			([event]) => event === 'lobby:state'
		)?.[1];

		await act(async () => {
			onLobbyState(updatedLobby);
		});

		expect(screen.getByLabelText('Player name')).toHaveTextContent('Jake');
	});
	// change deck button
	// change deck button changes view
});
