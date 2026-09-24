import { useState, ChangeEvent, SubmitEvent } from 'react';

import { signup } from './model';
import { useNavigate } from 'react-router';

const Signup = () => {
	const navigate = useNavigate();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			const missing = [
				!username.trim() ? 'Username' : '',
				!email.trim() ? 'Email' : '',
				!password.trim() ? 'Password' : '',
			].filter(Boolean);

			if (missing.length > 0) {
				setError(`${missing.join(', ')} Required`);
				return;
			}

			await signup(username, email, password);
			navigate('/');
		} catch (err) {
			/* v8 ignore if */
			if (err instanceof Error) {
				setError(err.message);
			} else {
				/* v8 ignore next */
				setError('Something went wrong');
			}
		}
	};

	const handleChange = (
		event: ChangeEvent<HTMLInputElement>,
		setValue: (value: string) => void,
	) => {
		setValue(event.currentTarget.value);
		setError('');
	};

	return (
		<form onSubmit={handleSubmit}>
			{error && <div>{error}</div>}
			<label htmlFor="username">Username</label>
			<input
				id="username"
				name="username"
				placeholder="Enter Username"
				value={username}
				onChange={(e) => handleChange(e, setUsername)}
			/>

			<label htmlFor="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				placeholder="Enter Email"
				value={email}
				onChange={(e) => handleChange(e, setEmail)}
			/>

			<label htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autoComplete="new-password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => handleChange(e, setPassword)}
			/>

			<button type="submit">Sign up</button>
		</form>
	);
};

export default Signup;