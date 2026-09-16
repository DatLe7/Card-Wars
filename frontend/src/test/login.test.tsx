import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { server } from '../../vitest.setup'
import { http, HttpResponse } from 'msw'

import { login } from './testutils';

import Login from '../auth/login'

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
})