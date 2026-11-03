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
		<form className="flex flex-col" onSubmit={handleSubmit}>
			{error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm wrap-anywhere text-red-800" role="alert">{error}</div>}
			<label className="mb-2 text-sm font-medium" htmlFor="username">Username</label>
			<input
				className="mb-5 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base placeholder:text-slate-500 focus:border-emerald-600"
				id="username"
				name="username"
				autoComplete="username"
				placeholder="Enter Username"
				value={username}
				onChange={(e) => handleChange(e, setUsername)}
			/>

			<label className="mb-2 text-sm font-medium" htmlFor="email">Email</label>
			<input
				className="mb-5 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base placeholder:text-slate-500 focus:border-emerald-600"
				id="email"
				name="email"
				type="email"
				autoComplete="email"
				placeholder="Enter Email"
				value={email}
				onChange={(e) => handleChange(e, setEmail)}
			/>

			<label className="mb-2 text-sm font-medium" htmlFor="password">Password</label>
			<input
				className="mb-5 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base placeholder:text-slate-500 focus:border-emerald-600"
				id="password"
				name="password"
				type="password"
				autoComplete="new-password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => handleChange(e, setPassword)}
			/>

			<button className="mt-1 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900" type="submit">Sign up<span aria-hidden="true"> →</span></button>
		</form>
	);
};

export default Signup;
