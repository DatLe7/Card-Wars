import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';

import LoginPage from '../../pages/login'

describe('Login Page', () => {
	it('renders login', () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>
		)
		expect(screen.getByLabelText('Username Or Email'))
		expect(screen.getByLabelText('Password'))
		expect(screen.getByRole('button', { name: 'Log in' }))
	})
	it('renders create account option', () => {
		render(
			<MemoryRouter>
				<LoginPage />
			</MemoryRouter>
		)
		expect(screen.getByText('Create an account'))
	})
})
