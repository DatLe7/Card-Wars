import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { server } from '../../vitest.setup';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router';

import userEvent from '@testing-library/user-event';

import LobbyListItem from '../lobby/listItem';
import LobbyList from '../lobby/list';
import LobbyCreate from '../lobby/create';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('Lobby List Item', () => {
	beforeEach(() => {
		render(<LobbyListItem name={'Dat\'s Lobby'} id='123' />);
	});
	it('renders the game title', () => {
		expect(screen.getByText('Dat\'s Lobby')).toBeInTheDocument();
	});
	it('lobby join endpoint called on press', async () => {
		const user = userEvent.setup();
		const joinRequest = vi.fn();

		server.use(
			http.post('/api/v0/lobby/:lobbyId/join', ({ params }) => {
				joinRequest(params.lobbyId);
				return HttpResponse.json({
					success: true,
				});
			}),
		);

		await user.click(screen.getByRole('button', { name: 'Dat\'s Lobby' }));
		expect(joinRequest).toHaveBeenCalledWith('123');
	});

	it('displays an error when unable to join the lobby', async () => {
		const user = userEvent.setup();

		server.use(
			http.post('/api/v0/lobby/:lobbyId/join', () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		await user.click(screen.getByRole('button', { name: 'Dat\'s Lobby' }));

		expect(await screen.findByText('Failed to join lobby')).toBeInTheDocument();
	});

	it('join button no longer visible after failed join', async () => {
		const user = userEvent.setup();

		server.use(
			http.post('/api/v0/lobby/:lobbyId/join', () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		await user.click(screen.getByRole('button', { name: 'Dat\'s Lobby' }));

		expect(
			screen.queryByRole('button', { name: 'Dat\'s Lobby' }),
		).not.toBeInTheDocument();
	});
});

describe('Lobby List', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});
	it('shows lobbies', async () => {
		server.use(
			http.get('/api/v0/lobby', () => {
				return HttpResponse.json([
					{
						name: 'Dat\'s Lobby',
						id: '123'
					},
					{
						name: 'random lobby',
						id: '321'
					}
				]);
			}),
		);

		render(<LobbyList />);

		expect(await screen.findByText('random lobby')).toBeInTheDocument();
	});

	it('shows an error when the lobby list endpoint fails', async () => {
		server.use(
			http.get('/api/v0/lobby', () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		render(<LobbyList />);

		expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load lobbies');
	});

	it('no lobbies rendered on error', async () => {
		server.use(
			http.get('/api/v0/lobby', () => {
				return new HttpResponse(null, { status: 500 });
			}),
		);

		render(<LobbyList />);

		expect(screen.queryAllByRole('button')).toHaveLength(0);
	});

	it('routes to room menu when joining a lobby', async () => {
		server.use(
			http.get('/api/v0/lobby', () => {
				return HttpResponse.json([
					{
						name: 'Dat\'s Lobby',
						id: '123'
					},
					{
						name: 'random lobby',
						id: '321'
					}
				]);
			}),
			http.post('/api/v0/lobby/:lobbyId/join', () => {
				return HttpResponse.json({
					success: true,
				});
			}),
		);

		render(
			<MemoryRouter>
				<LobbyList />
			</MemoryRouter>
		);

		await userEvent.click(await screen.findByRole('button', { name: 'Dat\'s Lobby' }));
		expect(mockNavigate).toHaveBeenCalledWith('/room/123');
	});
});


describe('create lobby', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
		render(<LobbyCreate />);
	});
	it('renders', () => {
		expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
	});
	it('shows error on failure', async () => {
		server.use(
			http.post('/api/v0/lobby', () => {
				return HttpResponse.json({ success: false }, { status: 500 });
			}),
		);

		await userEvent.click(screen.getByRole('button', { name: 'Create' }));

		expect(await screen.findByText('Failed to create lobby')).toBeInTheDocument();
	});
	it('routes to room upon creating lobby', async () => {
		server.use(
			http.post('/api/v0/lobby', () => {
				return HttpResponse.json(
					{
						name: 'Dat\'s Lobby',
						id: '123'
					},
				);
			}),
		);

		await userEvent.click(screen.getByRole('button', { name: 'Create' }));

		expect(mockNavigate).toHaveBeenCalledWith('/room/123');
	});
});
