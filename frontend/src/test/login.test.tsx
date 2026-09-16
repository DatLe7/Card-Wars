import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Login from '../auth/login'

describe('Login', () => {
	it('renders', () => {
		render(<Login />)
		expect(screen.getByLabelText('Username Or Email'))
		expect(screen.getByLabelText('Password'))
	})
})