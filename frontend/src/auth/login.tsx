const Login = () => {
	return (
		<form>
			<label htmlFor="identifier">Username Or Email</label>
			<input
				id="identifier"
				name="identifier"
				placeholder="Enter Username Or Email"
			/>
			<label htmlFor="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				placeholder="Enter Password"
			/>
		</form>
	)
}

export default Login