import Login from '../auth/login';
import AuthPage from './authPage';

const LoginPage = () => {
	return (
		<AuthPage
			title="Welcome back."
			description="Your next great battle is just a hand away."
			linkTo="/signup"
			linkText="Create an account"
		>
			<Login />
		</AuthPage>
	);
};

export default LoginPage;
