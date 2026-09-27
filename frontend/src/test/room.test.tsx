import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { mockSocket } from '../../vitest.setup';

import Room from '../room/room';
import { Lobby } from '../lobby';
import { SessionUser } from '../auth';
import { UserContext } from '@/context/userContext';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

const user: SessionUser = { id: '12313-321321-312321', name: 'Dat' };

const lobby: Lobby = {
	id: '123',
	name: 'Dat\'s Lobby',
	owner: { name: 'Dat', deck: 'finn' },
	player: { name: null, deck: 'finn' },
};

const renderRoom = () => render(
	<MemoryRouter initialEntries={['/room/123']}>
		<Routes>
			<Route path='/room/:id' element={
				<UserContext.Provider value={user}>
					<Room />
				</UserContext.Provider>
			} />
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
	it('Toggle deck renders', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByRole('button', { name: 'Toggle deck' })).toBeInTheDocument();
	});
	it('change deck button changes view', async () => {
		const user = userEvent.setup();
		const updatedLobby: Lobby = {
			...lobby,
			owner: { ...lobby.owner, deck: 'jake' },
		};
		mockSocket.emitWithAck
			.mockResolvedValueOnce(lobby)
			.mockResolvedValueOnce(updatedLobby)
			.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByLabelText('Owner deck')).toHaveTextContent('finn');

		await user.click(screen.getByRole('button', { name: 'Toggle deck' }));

		await waitFor(() => {
			expect(screen.getByLabelText('Owner deck')).toHaveTextContent('jake');
		});

		await user.click(screen.getByRole('button', { name: 'Toggle deck' }));

		await waitFor(() => {
			expect(screen.getByLabelText('Owner deck')).toHaveTextContent('finn');
		});
	});
	it('renders leave button', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByRole('button', { name: 'Leave' })).toBeInTheDocument();
	});
	it('leave button calls leave event', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		await userEvent.click(await screen.findByRole('button', { name: 'Leave' }));

		expect(mockSocket.emitWithAck).toHaveBeenCalledWith(
			'lobby:leave',
			{ lobbyId: lobby.id }
		);
	});
	it('leave button routes to home page', async () => {
		mockSocket.emitWithAck
			.mockResolvedValueOnce(lobby)
			.mockResolvedValueOnce({ lobbyId: lobby.id });
		renderRoom();

		await userEvent.click(await screen.findByRole('button', { name: 'Leave' }));

		expect(mockNavigate).toHaveBeenCalledWith('/');
	});
	it('renders start game button for owner', async () => {
		mockSocket.emitWithAck.mockResolvedValueOnce(lobby);
		renderRoom();

		expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument();
	});
	it('does not renders start game button for player', () => {
		mockSocket.emitWithAck.mockResolvedValueOnce({
			id: '321',
			name: 'Someones\'s Lobby',
			owner: { name: 'someone', deck: 'finn' },
			player: { name: 'dat', deck: 'finn' },
		});
		renderRoom();

		expect(
			screen.queryByRole('button', { name: 'Start' })
		).not.toBeInTheDocument();
	});
});
