import { act, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';

import type { SessionUser } from '@/auth';
import { mockSocket } from '../../vitest.setup';
import { sampleGameView } from './testutils';
import GameBoard from '../game/gameboard';

const user: SessionUser = { id: 'player-1', name: 'Dat' };
type GameView = ReturnType<typeof sampleGameView>;

async function emitGameState(view: GameView) {
	const listener = mockSocket.on.mock.calls.find(
		([event]) => event === 'game:state',
	)?.[1] as ((nextView: GameView) => void) | undefined;

	if (!listener) throw new Error('GameBoard did not subscribe to game:state');
	await act(async () => {
		listener(view);
	});
}

describe('GameBoard', () => {
	it('renders the game board after receiving game state', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		expect(screen.getByRole('heading', { name: 'Game board' })).toBeInTheDocument();
	});

	it('renders the player name', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		expect(screen.getByText('Dat')).toBeInTheDocument();
	});

	it('renders the player life total', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		expect(screen.getByLabelText('Your life')).toHaveTextContent('25');
	});

	it('renders the opponent life total', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		expect(screen.getByLabelText('Opponent life')).toHaveTextContent('25');
	});

	it('renders the current turn number', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		expect(screen.getByText('Turn 1')).toBeInTheDocument();
	});

	it('renders all cards in the player hand', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		const hand = screen.getByRole('region', { name: 'Your hand' });
		expect(within(hand).getAllByText('Ancient Scholar')).toHaveLength(5);
	});

	it('renders the available next turn action', async () => {
		render(<GameBoard />);
		await emitGameState(sampleGameView(user));

		expect(screen.getByRole('button', { name: 'Next turn' })).toBeInTheDocument();
	});

	it('sends the selected action to the game socket', async () => {
		const view = sampleGameView(user);
		render(<GameBoard gameId="room-123" initialView={view} />);
		await userEvent.click(screen.getByRole('button', { name: 'Next turn' }));

		expect(mockSocket.emit).toHaveBeenCalledWith('game:action', {
			gameId: 'room-123',
			action: view.actions[0],
		});
	});

	it('updates the current turn when a new game state arrives', async () => {
		const initialView = sampleGameView(user);
		const updatedView = {
			...initialView,
			turn: { ...initialView.turn, number: 2 },
			game: {
				...initialView.game,
				player: { ...initialView.game.player, life: 21 },
				enemy: { ...initialView.game.enemy, life: 19 },
			},
		};
		render(<GameBoard />);
		await emitGameState(initialView);
		await emitGameState(updatedView);

		expect(screen.getByText('Turn 2')).toBeInTheDocument();
	});

	it('updates the player life total when a new game state arrives', async () => {
		const initialView = sampleGameView(user);
		const updatedView = {
			...initialView,
			game: { ...initialView.game, player: { ...initialView.game.player, life: 21 } },
		};
		render(<GameBoard />);
		await emitGameState(initialView);
		await emitGameState(updatedView);

		expect(screen.getByLabelText('Your life')).toHaveTextContent('21');
	});

	it('updates the opponent life total when a new game state arrives', async () => {
		const initialView = sampleGameView(user);
		const updatedView = {
			...initialView,
			game: { ...initialView.game, enemy: { ...initialView.game.enemy, life: 19 } },
		};
		render(<GameBoard />);
		await emitGameState(initialView);
		await emitGameState(updatedView);

		expect(screen.getByLabelText('Opponent life')).toHaveTextContent('19');
	});
});
