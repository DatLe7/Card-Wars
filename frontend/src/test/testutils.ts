import { screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

export const signup = async (username: string, email: string, password: string): Promise<void> => {
	const user = userEvent.setup()

	const usernameInput = screen.getByLabelText('Username')
	const emailInput = screen.getByLabelText('Email')
	const passwordInput = screen.getByLabelText('Password')
	const signupButton = screen.getByRole('button', { name: 'Sign up' })

	if (username) await user.type(usernameInput, username)
	if (email) await user.type(emailInput, email)
	if (password) await user.type(passwordInput, password)
	await user.click(signupButton)
}

export const login = async (identifier: string, password: string): Promise<void> => {
	const user = userEvent.setup()

	const identifierInput = screen.getByLabelText('Username Or Email')
	const passwordInput = screen.getByLabelText('Password')
	const signupButton = screen.getByRole('button', { name: 'Log in' })

	if (identifier) await user.type(identifierInput, identifier)
	if (password) await user.type(passwordInput, password)
	await user.click(signupButton)
}