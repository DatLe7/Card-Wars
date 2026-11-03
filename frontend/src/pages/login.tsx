import Login from '../auth/login';
import AuthPage from './authPage';

const LoginPage = () => {
	return (
		<div className="relative isolate flex min-h-svh flex-col bg-emerald-950 font-sans text-slate-900 [&_:is(a,button,input):focus-visible]:outline-2 [&_:is(a,button,input):focus-visible]:outline-offset-4 [&_:is(a,button,input):focus-visible]:outline-emerald-600">
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
				<div className="absolute inset-0 scale-110 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat" />
			</div>
			<div className="pointer-events-none fixed inset-0 -z-10 bg-black/40" aria-hidden="true" />
			<main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10 sm:px-6">
				<AuthPage
					title="Welcome back."
					description="Log in to join a game."
					linkTo="/signup"
					linkText="Create an account"
				>
					<Login />
				</AuthPage>
			</main>
		</div>
	);
};

export default LoginPage;
