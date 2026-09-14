import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Signup from '../auth/signup'


describe('Signup', () => {
	it('renders', () => {
		render(<Signup />)
		expect(screen.getByLabelText('Username')).toBeInTheDocument()
		expect(screen.getByLabelText('Email')).toBeInTheDocument()
		expect(screen.getByLabelText('Password')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Sign up' })
		).toBeInTheDocument();
	})
})
