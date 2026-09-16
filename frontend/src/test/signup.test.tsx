import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { server } from '../../vitest.setup'
import { http, HttpResponse } from 'msw'

import userEvent from '@testing-library/user-event';

import { signup } from './testutils';

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
	it('Error message clears when typing on input', async () => {
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

		const error = await screen.findByText('Invalid signup details or username in use')

		const username = screen.getByLabelText('Username')
		await userEvent.clear(username)
		await userEvent.type(username, 'Not Fails')

		expect(error).not.toBeInTheDocument()
	})
	it('requires username', async () => {
		render(<Signup />)
		await signup('', 'fail@email.com', 'password')

		expect(await screen.findByText('Username Required'))
			.toBeInTheDocument()
	})
	it('requires email', async () => {
		render(<Signup />)
		await signup('fail', '', 'password')

		expect(await screen.findByText('Email Required'))
			.toBeInTheDocument()
	})
	it('requires password', async () => {
		render(<Signup />)
		await signup('fail', 'fail@email.com', '')

		expect(await screen.findByText('Password Required'))
			.toBeInTheDocument()
	})
	it('requires all fields', async () => {
		render(<Signup />)
		await signup('', '', '')

		expect(await screen.findByText('Username, Email, Password Required'))
			.toBeInTheDocument()
	})
})
