import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { server } from '../../vitest.setup'
import { http, HttpResponse } from 'msw'

import { login } from './testutils';

import Login from '../auth/login'
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('Login', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});
	it('renders', () => {
		render(<Login />)
		expect(screen.getByLabelText('Username Or Email'))
		expect(screen.getByLabelText('Password'))
		expect(screen.getByRole('button', { name: 'Log in' }))
	})
	it('navigates to home on login suceed', async () => {
		server.use(
			http.post('/api/v0/auth/login', () => {
				return HttpResponse.json({
					success: true,
				})
			})
		)

		render(
			<MemoryRouter>
				<Login />
			</MemoryRouter>
		)

		await login('dat', 'password')

		expect(mockNavigate).toHaveBeenCalledWith('/');
	})

	it('error message shown on failed login', async () => {
		server.use(
			http.post('/api/v0/auth/login', () => {
				return HttpResponse.json(
					{ message: 'Bad credentials' },
					{ status: 401 }
				)
			})
		)

		render(<Login />)

		await login('dat', 'password')

		expect(await screen.findByText('Bad credentials')).toBeInTheDocument()
	})

	it('error message gets clear on typing', async () => {
		server.use(
			http.post('/api/v0/auth/login', () => {
				return HttpResponse.json(
					{ message: 'Bad credentials' },
					{ status: 401 }
				)
			})
		)

		render(<Login />)

		await login('dat', 'password')

		const error = await screen.findByText('Bad credentials')

		const passwordInput = screen.getByLabelText('Password')
		await userEvent.clear(passwordInput)
		await userEvent.type(passwordInput, 'realPassword')

		expect(error).not.toBeInTheDocument()
	})
	it('requires identifier', async () => {
		render(<Login />)

		await login('', 'password')

		expect(await screen.findByText('Username Or Email Required'))
	})
	it('requires password', async () => {
		render(<Login />)

		await login('dat', '')

		expect(await screen.findByText('Password Required'))
	})
	it('requires all fields', async () => {
		render(<Login />)

		await login('', '')

		expect(await screen.findByText('Username Or Email, Password Required'))
	})
	// requires all fields
})