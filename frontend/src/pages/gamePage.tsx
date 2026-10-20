import type { ReactNode } from 'react';

interface GamePageProps {
	children: ReactNode;
	layout: 'auth' | 'wide';
}

const GamePage = ({ children, layout }: GamePageProps) => (
	<div className="relative isolate flex min-h-svh flex-col bg-[#17271d] px-[clamp(20px,5vw,80px)] pt-8 pb-[22px] font-[Trebuchet_MS,Segoe_UI,sans-serif] leading-normal text-[#f7f1dc] [&_h1]:font-[Georgia,Times_New_Roman,serif] [&_h1]:font-bold [&_h2]:font-[Georgia,Times_New_Roman,serif] [&_h2]:font-bold [&_h3]:font-[Georgia,Times_New_Roman,serif] [&_h3]:font-bold [&_:is(a,button,input):focus-visible]:outline-3 [&_:is(a,button,input):focus-visible]:outline-offset-4 [&_:is(a,button,input):focus-visible]:outline-[#527c60] motion-reduce:[&_*]:transition-none max-[800px]:px-6 max-[800px]:pt-6 max-[800px]:pb-5 max-[480px]:px-4">
		<div className="pointer-events-none fixed inset-0 -z-10 bg-[url('/images/cardWarsBackground.png')] bg-cover bg-center bg-no-repeat" aria-hidden="true" />
		<div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(90deg,#0a1911ab,#0a191133_48%,#0a1911a8),linear-gradient(0deg,#08140ee6,transparent_70%,#08140e73)]" aria-hidden="true" />
		<header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5">
			<div className="flex items-center gap-3.5 font-[Georgia,Times_New_Roman,serif] text-2xl font-extrabold tracking-[-0.6px] max-[480px]:text-[21px]">
				<span className="relative grid h-10 w-[31px] -rotate-10 place-items-center rounded-[5px] border border-[#efd07b] text-[#efd07b] before:absolute before:inset-0 before:-z-10 before:translate-x-[5px] before:-translate-y-0.5 before:rotate-15 before:rounded-[inherit] before:border before:border-[#b29c64] before:content-['']" aria-hidden="true"><span>✦</span></span>
				<span>Card Wars<small className="block font-[Trebuchet_MS,sans-serif] text-[10px] leading-[1.6] font-normal tracking-[2.6px] text-[#d2d4bb] uppercase">Adventure awaits</small></span>
			</div>
			<span className="text-xs tracking-[0.3px] text-[#dedfcf] max-[800px]:hidden">A little strategy. A lot of adventure.</span>
		</header>
		<main className={layout === 'auth'
			? 'mx-auto grid w-full max-w-7xl flex-1 grid-cols-[1fr_minmax(340px,440px)] items-center gap-[clamp(36px,7vw,112px)] py-16 min-[1600px]:grid-cols-[1fr_460px] max-[800px]:grid-cols-1 max-[800px]:justify-items-center max-[800px]:gap-[30px] max-[800px]:py-[42px]'
			: 'mx-auto w-full max-w-[960px] flex-1 pt-14 pb-16 max-[800px]:pt-10'
		}>{children}</main>
		<footer className="mx-auto flex w-full max-w-7xl items-center justify-between gap-5 text-[10px] tracking-[0.5px] text-[#c5c9b9] max-[800px]:text-[9px] max-[480px]:flex-col max-[480px]:gap-1.5 max-[480px]:text-center">
			<span>Made for a little friendly rivalry.</span>
			<span>Shuffle. Play. Floop.</span>
		</footer>
	</div>
);

export default GamePage;
