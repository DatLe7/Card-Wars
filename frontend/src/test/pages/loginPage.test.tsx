import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';

import userEvent from '@testing-library/user-event';

import LoginPage from '../../pages/login';

describe('Login Page', () => {
	it('renders login', () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>
		);
		expect(screen.getByLabelText('Username Or Email'));
		expect(screen.getByLabelText('Password'));
		expect(screen.getByRole('button', { name: 'Log in' }));
	});
	it('renders create account option', () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>
		);
		expect(screen.getByText('Create an account'));
	});
	it('clicking create account routes to signup', async () => {
		const user = userEvent.setup();

		render(
			<MemoryRouter initialEntries={['/login']}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route
						path="/signup"
						element={<h1>Signup page</h1>}
					/>
				</Routes>
			</MemoryRouter>
		);

		await user.click(
			screen.getByRole('link', { name: 'Create an account' })
		);

		expect(
			screen.getByRole('heading', { name: 'Signup page' })
		).toBeInTheDocument();
	});
});
