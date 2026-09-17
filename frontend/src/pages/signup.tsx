import { Link } from 'react-router';

import Signup from '../auth/signup'

const SignupPage = () => {
	return (
		<div>
			<Signup />
			<Link to="/login">Already have an account? Log in.</Link>
		</div>
	)
}

export default SignupPage