import { useState } from 'react'

import { signup } from './model'
import { useNavigate } from 'react-router'

const Signup = () => {
	const navigate = useNavigate()

	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		try {
			await signup(username, email, password)
			navigate('/')
		} catch (err) {
			/* v8 ignore if */
			if (err instanceof Error) {
				setError(err.message)
			} else {
				/* v8 ignore next */
				setError('Something went wrong')
			}
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			{error && <div>{error}</div>}
			<label htmlFor="username">Username</label>
			<input
				id="username"
				name="username"
				placeholder="Enter Username"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>

			<label htmlFor="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				placeholder="Enter Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>

			<label htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autoComplete="new-password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>

			<button type="submit">Sign up</button>
		</form>
	)
}

export default Signup