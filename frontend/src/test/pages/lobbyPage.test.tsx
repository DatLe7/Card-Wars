import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react'

import LobbyPage from '../../pages/lobby'

describe('lobby', () => {
	it('renders', () => {
		render(<LobbyPage />)
		expect(screen.getByText('Lobbies')).toBeInTheDocument()
	})
})