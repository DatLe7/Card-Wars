import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { server } from '../../vitest.setup'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event';

import LobbyListItem from "../lobby/listItem"

describe('Lobby List Item', () => {
	beforeEach(() => {
		render(<LobbyListItem name="Dat's Lobby" id="123" />)
	})
	it('renders the game title', () => {
		expect(screen.getByText("Dat's Lobby")).toBeInTheDocument()
	})
	it('lobby join endpoint called on press', async () => {
		const user = userEvent.setup()
		const joinRequest = vi.fn()

		server.use(
			http.post('/api/lobbies/:lobbyId', ({ params }) => {
				joinRequest(params.lobbyId)
				return HttpResponse.json({
					success: true,
				})
			}),
		)

		await user.click(screen.getByRole('button', { name: "Dat's Lobby" }))
		expect(joinRequest).toHaveBeenCalledWith('123')
	})

	it('displays an error when unable to join the lobby', async () => {
		const user = userEvent.setup()

		server.use(
			http.post('/api/lobbies/:lobbyId', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		await user.click(screen.getByRole('button', { name: "Dat's Lobby" }))

		expect(await screen.findByText('Failed to join lobby')).toBeInTheDocument()
	})

	it('join button no longer visible after failed join', async () => {
		const user = userEvent.setup()

		server.use(
			http.post('/api/lobbies/:lobbyId', () => {
				return new HttpResponse(null, { status: 500 })
			}),
		)

		await user.click(screen.getByRole('button', { name: "Dat's Lobby" }))

		expect(
			screen.queryByRole('button', { name: "Dat's Lobby" }),
		).not.toBeInTheDocument()
	})
})

describe('Lobby List', () => {
	it('shows lobbies', () => {

	})
})