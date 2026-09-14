const Signup = () => {
	return (
		<form onSubmit={(event) => event.preventDefault()}>
			<label htmlFor="username">Username</label>
			<input id="username" name="username" placeholder="Enter Username" />
			<label htmlFor="email">Email</label>
			<input id="email" name="email" type="email" placeholder="Enter Email" />
			<label htmlFor="password">Password</label>
			<input id="password" name="password" type="password" autoComplete="new-password" placeholder="Enter Password" />
			<button type="submit">Sign up</button>
		</form>
	)
}

export default Signup
