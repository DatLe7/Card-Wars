import Signup from '../auth/signup';
import AuthPage from './authPage';

const SignupPage = () => {
	return (
		<AuthPage
			title="Join the adventure."
			description="Make a name for yourself at the table."
			linkTo="/login"
			linkText="Already have an account? Log in."
		>
			<Signup />
		</AuthPage>
	);
};

export default SignupPage;
