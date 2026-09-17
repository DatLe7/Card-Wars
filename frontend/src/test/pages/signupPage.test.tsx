import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

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
})