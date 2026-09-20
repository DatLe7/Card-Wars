import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import { http, HttpResponse } from 'msw'
import { server } from '../../vitest.setup'

import App from '../App'

describe('App', () => {
	it('renders the game title', () => {
		render(<MemoryRouter><App /></MemoryRouter>)
	})
	it('routes to login page if unauthenticated', async () => {
		server.use(
			http.get('/api/v0/auth/me', () => {
				return HttpResponse.json(
					{ message: 'Authentication required' },
					{ status: 401 },
				)
			}),
		)

		render(
			<MemoryRouter initialEntries={['/']}>
				<App />
			</MemoryRouter>
		)

		expect(
			await screen.findByRole('button', { name: 'Log in' }),
		).toBeInTheDocument()
	})
	it('loads the lobby page if authenticated', async () => {
		server.use(
			http.get('/api/v0/auth/me', () => {
				return HttpResponse.json(
					{ id: '123', username: 'testuser' },
					{ status: 200 },
				)
			}),
		)

		render(
			<MemoryRouter initialEntries={['/']}>
				<App />
			</MemoryRouter>
		)

		expect(await screen.findByText('Lobbies')).toBeInTheDocument()
	})
})
