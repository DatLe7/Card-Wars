import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface AuthPageProps {
	title: string;
	description: string;
	linkTo: string;
	linkText: string;
	children: ReactNode;
}

const AuthPage = ({ title, description, linkTo, linkText, children }: AuthPageProps) => (
	<section className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8" aria-labelledby="auth-title">
		<h1 className="text-2xl font-semibold tracking-tight" id="auth-title">{title}</h1>
		<p className="mt-2 mb-7 text-sm text-slate-600">{description}</p>
		{children}
		<div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm">
			<Link className="rounded text-emerald-800 underline-offset-4 hover:underline" to={linkTo}>{linkText}</Link>
		</div>
	</section>
);

export default AuthPage;
