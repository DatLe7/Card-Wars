import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { server } from '../../vitest.setup'
import { http, HttpResponse } from 'msw'

import userEvent from '@testing-library/user-event';

import Signup from '../auth/signup'

const signup = async (username: string, email: string, password: string) => {
	const user = userEvent.setup()

	const usernameInput = screen.getByLabelText('Username')
	const emailInput = screen.getByLabelText('Email')
	const passwordInput = screen.getByLabelText('Password')
	const signupButton = screen.getByRole('button', { name: 'Sign up' })

	await user.type(usernameInput, username)
	await user.type(emailInput, email)
	await user.type(passwordInput, password)
	await user.click(signupButton)
}


const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('Signup', () => {
	beforeEach(() => {
		mockNavigate.mockClear();
	});
	it('renders', () => {
		render(<Signup />)
		expect(screen.getByLabelText('Username')).toBeInTheDocument()
		expect(screen.getByLabelText('Email')).toBeInTheDocument()
		expect(screen.getByLabelText('Password')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Sign up' })
		).toBeInTheDocument();
	})
	it('navigates to home when signed up suceeds', async () => {
		server.use(
			http.post('/api/v0/auth/signup', () => {
				return HttpResponse.json({
					success: true,
				})
			})
		)
		render(
			<MemoryRouter>
				<Signup />
			</MemoryRouter>
		)
		await signup('dat', 'dat@email', 'password')

		expect(mockNavigate).toHaveBeenCalledWith('/');
	})
	it('error message on signup fail', async () => {
		server.use(
			http.post('/api/v0/auth/signup', () => {
				return HttpResponse.json(
					{ message: 'Invalid signup details or username in use' },
					{ status: 400 },
				)
			})
		)
		render(
			<MemoryRouter>
				<Signup />
			</MemoryRouter>
		)
		await signup('fail', 'fail@email.com', 'password')

		expect(await screen.findByText('Invalid signup details or username in use')
		).toBeInTheDocument()
	})
	// Error message clears when typing on input
	// Requires username, email, password
})
