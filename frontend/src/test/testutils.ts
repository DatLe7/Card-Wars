import { screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import type { SessionUser } from '../auth';

export const signup = async (username: string, email: string, password: string): Promise<void> => {
	const user = userEvent.setup();

	const usernameInput = screen.getByLabelText('Username');
	const emailInput = screen.getByLabelText('Email');
	const passwordInput = screen.getByLabelText('Password');
	const signupButton = screen.getByRole('button', { name: 'Sign up' });

	if (username) await user.type(usernameInput, username);
	if (email) await user.type(emailInput, email);
	if (password) await user.type(passwordInput, password);
	await user.click(signupButton);
};

export const login = async (identifier: string, password: string): Promise<void> => {
	const user = userEvent.setup();

	const identifierInput = screen.getByLabelText('Username Or Email');
	const passwordInput = screen.getByLabelText('Password');
	const signupButton = screen.getByRole('button', { name: 'Log in' });

	if (identifier) await user.type(identifierInput, identifier);
	if (password) await user.type(passwordInput, password);
	await user.click(signupButton);
};

export const sampleGameView = (user: SessionUser) => {
	const landscapes = ['Blue Plains', 'Blue Plains', 'Blue Plains', 'Blue Plains'];
	return {
		id: user.id,
		name: user.name,
		decklist: {
			landscape: landscapes,
			deck: [{ cardId: 'ancient_scholar', count: 40 }],
		},
		turn: { number: 1, activePlayerId: user.id, phase: 'READY' },
		game: {
			player: {
				life: 25,
				actionPoints: 0,
				deckCardCount: 0,
				hand: Array.from({ length: 5 }, (_, index) => ({
					instanceId: `${user.id}_ancient_scholar_${index + 1}`,
					ownerId: user.id,
					cardId: 'ancient_scholar',
					name: 'Ancient Scholar',
					type: 'creature',
					land: 'Blue Plains',
					cost: 1,
					attack: 1,
					defence: 7,
					atkMod: 0,
					defMod: 0,
					damage: 0,
					canFloop: true,
					isFlooped: false,
				})),
				graveyard: [],
				lands: landscapes.map((landscape) => ({ landscape })),
			},
			enemy: {
				life: 25,
				actionPoints: 0,
				deckCardCount: 0,
				handCardCount: 5,
				graveyardCardCount: 0,
				lands: landscapes.map((landscape) => ({ landscape })),
			},
		},
		actions: [{ type: 'NEXT_TURN', playerId: user.id }],
	};
};
