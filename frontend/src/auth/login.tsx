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
		<form className="flex flex-col [&>label]:mb-2 [&>label]:text-xs [&>label]:font-bold [&>input]:mb-5 [&>input]:min-h-12 [&>input]:w-full [&>input]:rounded-[7px] [&>input]:border [&>input]:border-[#d5d0b9] [&>input]:bg-white/65 [&>input]:px-3.5 [&>input]:py-3 [&>input]:text-base [&>input]:text-[#24382e] [&>input]:transition-[border-color,box-shadow] [&>input]:duration-150 [&>input::placeholder]:text-[13px] [&>input::placeholder]:text-[#818774] [&>input:focus]:border-[#527c60] [&>input:focus]:shadow-[0_0_0_3px_#527c601f] [&>button]:mt-1 [&>button]:justify-between" onSubmit={handleSubmit}>
			{error && <div className="mb-4 rounded-[7px] border border-[#d8ae96] bg-[#fae9da] px-3.5 py-3 text-[13px] wrap-anywhere text-[#853a2d]" role="alert">{error}</div>}
			<label htmlFor="identifier">Username Or Email</label>
			<input
				id="identifier"
				name="identifier"
				autoComplete="username"
				placeholder="Enter Username Or Email"
				value={identifier}
				onChange={(e) => handleChange(e, setIdentifier)}
			/>
			<label htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autoComplete="current-password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => handleChange(e, setPassword)}
			/>
			<button className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-3 rounded-[7px] border px-6 py-3 text-[13px] leading-[1.4] font-bold transition-[background,transform,box-shadow] duration-150 border-[#244932] bg-[#2f543b] text-[#fff8df] shadow-[0_3px_0_#203b2a] hover:-translate-y-px hover:bg-[#3c6849] active:translate-y-px active:shadow-[0_1px_0_#203b2a]" type="submit">Log in<span aria-hidden="true"> →</span></button>
		</form>
	);
};

export default Login;
