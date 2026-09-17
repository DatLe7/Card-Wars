import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

import userEvent from '@testing-library/user-event';

import SignupPage from '../../pages/signup'

describe('Signup Page', () => {
	it('renders signup', () => {
		render(
			<MemoryRouter>
				<SignupPage />
			</MemoryRouter>
		)

		expect(screen.getByLabelText('Username')).toBeInTheDocument()
		expect(screen.getByLabelText('Email')).toBeInTheDocument()
		expect(screen.getByLabelText('Password')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Sign up' })
		).toBeInTheDocument();
	})
	it('renders login link', () => {
		render(
			<MemoryRouter>
				<SignupPage />
			</MemoryRouter>
		)

		expect(screen.getByText('Already have an account? Log in.')).toBeInTheDocument()
	})
	it('already have account links to login page', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter initialEntries={['/signup']}>
				<Routes>
					<Route path="/signup" element={<SignupPage />} />
					<Route
						path="/login"
						element={<h1>Login page</h1>}
					/>
				</Routes>
			</MemoryRouter>
		);

		await user.click(
			screen.getByRole('link', { name: 'Already have an account? Log in.' })
		);

		expect(
			screen.getByRole('heading', { name: 'Login page' })
		).toBeInTheDocument();
	})
})