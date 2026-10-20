import type { ReactNode } from 'react';
import { Link } from 'react-router';
import GamePage from './gamePage';

interface AuthPageProps {
	title: string;
	description: string;
	linkTo: string;
	linkText: string;
	children: ReactNode;
}

const AuthPage = ({ title, description, linkTo, linkText, children }: AuthPageProps) => (
	<GamePage layout="auth">
		<section className="max-w-[570px] self-end pb-9 text-shadow-[0_2px_20px_#00000040] [&>h1]:text-[clamp(40px,4.5vw,68px)] [&>h1]:leading-[1.07] [&>h1]:tracking-[-2px] [&>p:first-child]:text-[#efd07b] [&>p:nth-child(3)]:mt-6 [&>p:nth-child(3)]:mb-7 [&>p:nth-child(3)]:max-w-[350px] [&>p:nth-child(3)]:text-base [&>p:nth-child(3)]:leading-[1.8] [&>p:nth-child(3)]:text-[#e1e3cf] max-[800px]:pb-0 max-[800px]:text-center max-[800px]:[&>h1]:text-[42px] max-[800px]:[&>p:nth-child(3)]:mx-auto max-[800px]:[&>p:nth-child(3)]:mt-4 max-[800px]:[&>p:nth-child(3)]:mb-0 max-[800px]:[&>p:nth-child(3)]:text-sm max-[480px]:[&>h1]:text-[35px] max-[480px]:[&>h1]:tracking-[-1px]" aria-labelledby="adventure-title">
			<p className="mb-3 text-[10px] font-extrabold tracking-[2.5px] text-[#6b704f] uppercase">Welcome to the land of Ooo</p>
			<h1 id="adventure-title">Adventure is<br />in your hands.</h1>
			<p>Choose your deck, challenge a friend, and make your next move legendary.</p>
			<div className="flex items-center gap-3 text-[11px] text-[#d9d8bd] [&>span]:text-[23px] [&>span]:text-[#efd07b] max-[800px]:hidden"><span aria-hidden="true">✦</span> One table. Two challengers. Endless possibilities.</div>
		</section>
		<section className="rounded-[18px] border border-[#e4dac0] bg-[linear-gradient(145deg,#fffbee,#eee9d5)] text-[#24382e] shadow-[0_24px_80px_#0000004d,inset_0_0_0_5px_#ffffff59] max-[480px]:rounded-xl relative border-t-4 border-t-[#d9b45b] p-10 [&>h2]:text-[clamp(27px,2.6vw,34px)] [&>h2]:leading-[1.2] [&>h2]:tracking-[-1.1px] max-[800px]:w-full max-[800px]:max-w-[460px] max-[480px]:px-5 max-[480px]:py-[26px]" aria-labelledby="auth-title">
			<div className="mb-[26px] grid size-[42px] place-items-center rounded-full border border-[#d8cda9] text-[25px] text-[#947128] max-[480px]:mb-[18px]" aria-hidden="true">✦</div>
			<p className="mb-3 text-[10px] font-extrabold tracking-[2.5px] text-[#6b704f] uppercase">Take your seat</p>
			<h2 id="auth-title">{title}</h2>
			<p className="mt-3 mb-7 text-[13px] text-[#66705e]">{description}</p>
			{children}
			<div className="mt-7 border-t border-[#d9d4bd] pt-[22px] text-center text-xs [&>a]:text-[#35523a] [&>a]:underline [&>a]:decoration-[#b6b99e] [&>a]:underline-offset-4 [&>a:hover]:decoration-current"><Link to={linkTo}>{linkText}</Link></div>
		</section>
	</GamePage>
);

export default AuthPage;
