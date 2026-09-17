import { Link } from 'react-router';

import Login from '../auth/login'

const LoginPage = () => {
	return (
		<div>
			<Login />
			<Link to="/signup">Create an account</Link>
		</div>
	)
}

export default LoginPage