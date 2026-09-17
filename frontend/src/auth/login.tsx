import { useState, SubmitEvent, ChangeEvent } from 'react'
import { login } from './model'
import { useNavigate } from 'react-router'

const Login = () => {
	const navigate = useNavigate()

	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault()
		try {
			const missing = [
				!identifier.trim() ? 'Username Or Email' : '',
				!password.trim() ? 'Password' : '',
			].filter(Boolean)

			if (missing.length > 0) {
				setError(`${missing.join(', ')} Required`)
				return
			}

			await login(identifier, password)
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

	const handleChange = (
		event: ChangeEvent<HTMLInputElement>,
		setValue: (value: string) => void,
	) => {
		setValue(event.currentTarget.value)
		setError('')
	}

	return (
		<form onSubmit={handleSubmit}>
			{error && <div>{error}</div>}
			<label htmlFor="identifier">Username Or Email</label>
			<input
				id="identifier"
				name="identifier"
				placeholder="Enter Username Or Email"
				value={identifier}
				onChange={(e) => handleChange(e, setIdentifier)}
			/>
			<label htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				placeholder="Enter Password"
				value={password}
				onChange={(e) => handleChange(e, setPassword)}
			/>
			<button type="submit">Log in</button>
		</form>
	)
}

export default Login