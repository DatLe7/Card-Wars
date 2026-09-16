import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { server } from '../../vitest.setup'
import { http, HttpResponse } from 'msw'

import userEvent from '@testing-library/user-event';

import Signup from '../auth/signup'


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
		const user = userEvent.setup()

		const usernameInput = screen.getByLabelText('Username')
		const emailInput = screen.getByLabelText('Email')
		const passwordInput = screen.getByLabelText('Password')
		const signupButton = screen.getByRole('button', { name: 'Sign up' })

		await user.type(usernameInput, 'dat')
		await user.type(emailInput, 'dat@email.com')
		await user.type(passwordInput, 'datpassword')
		await user.click(signupButton)

		expect(mockNavigate).toHaveBeenCalledWith('/');
	})
})
