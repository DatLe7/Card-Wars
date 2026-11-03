import { useState, SubmitEvent, ChangeEvent } from 'react';
import { login } from './model';
import { useNavigate } from 'react-router';

const Login = () => {
	const navigate = useNavigate();

	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			const missing = [
				!identifier.trim() ? 'Username Or Email' : '',
				!password.trim() ? 'Password' : '',
			].filter(Boolean);

			if (missing.length > 0) {
				setError(`${missing.join(', ')} Required`);
				return;
			}

			await login(identifier, password);
			navigate('/');
		} catch (err) {
			setError((err as Error).message);
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
			<label className="mb-2 text-sm font-medium" htmlFor="identifier">Username Or Email</label>
			<input
				className="mb-5 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base placeholder:text-slate-500 focus:border-emerald-600"
				id="identifier"
				name="identifier"
				autoComplete="username"
				placeholder="Enter Username Or Email"
				value={identifier}
				onChange={(e) => handleChange(e, setIdentifier)}
			/>
			<label className="mb-2 text-sm font-medium" htmlFor="password">Password</label>
			<input
				className="mb-5 min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base placeholder:text-slate-500 focus:border-emerald-600"
				id="password"
				name="password"
				type="password"
				autoComplete="current-password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => handleChange(e, setPassword)}
			/>
			<button className="mt-1 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900" type="submit">Log in<span aria-hidden="true"> →</span></button>
		</form>
	);
};

export default Login;
