import { useState, SubmitEvent } from 'react'
import { login } from './model'
import { useNavigate } from 'react-router'

const Login = () => {
	const navigate = useNavigate()

	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		try {
			await login(identifier, password)
			navigate('/')
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="identifier">Username Or Email</label>
			<input
				id="identifier"
				name="identifier"
				placeholder="Enter Username Or Email"
				value={identifier}
				onChange={(e) => setIdentifier(e.currentTarget.value)}
			/>
			<label htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
			/>
			<button type="submit">Log in</button>
		</form>
	)
}

export default Login