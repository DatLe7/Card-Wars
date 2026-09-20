import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react'
import { server } from '../../../vitest.setup'
import { http, HttpResponse } from 'msw'

import LobbyPage from '../../pages/lobby'
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('lobby', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
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
				])
			}),
			http.post('/api/v0/lobby/:lobbyId/join', () => {
				return HttpResponse.json({
					success: true,
				})
			}),
		)
		render(
			<MemoryRouter>
				<LobbyPage />
			</MemoryRouter>
		)
	})
	it('renders', () => {
		expect(screen.getByText('Lobbies')).toBeInTheDocument()
	})
	it('renders lobbies', async () => {
		expect(await screen.findByText('random lobby')).toBeInTheDocument()
	})
	it('routes to game room on click', async () => {
		await userEvent.click(await screen.findByRole('button', { name: 'Dat\'s Lobby' }))
		expect(mockNavigate).toHaveBeenCalledWith('/room/123')
	})
})