import LobbyList from '@/lobby/list';
import LobbyCreate from '@/lobby/create';
import GamePage from './gamePage';

const LobbyPage = () => {
	return (
		<GamePage layout="wide">
			<div className="mb-8 text-center text-shadow-[0_2px_16px_#102019] [&>p:first-child]:text-[#efd07b] [&>h1]:text-[clamp(30px,3.6vw,48px)] [&>h1]:leading-[1.2] [&>h1]:tracking-[-1.3px] [&>p:last-child]:mt-4 [&>p:last-child]:text-sm [&>p:last-child]:text-[#e5e5d3]">
				<p className="mb-3 text-[10px] font-extrabold tracking-[2.5px] text-[#6b704f] uppercase">A challenger awaits</p>
				<h1>Find your next adventure.</h1>
				<p>Pull up a chair at an open table, or start one of your own.</p>
			</div>
			<section className="rounded-[18px] border border-[#e4dac0] bg-[linear-gradient(145deg,#fffbee,#eee9d5)] text-[#24382e] shadow-[0_24px_80px_#0000004d,inset_0_0_0_5px_#ffffff59] max-[480px]:rounded-xl p-8 max-[480px]:px-5 max-[480px]:py-[26px]" aria-labelledby="lobbies-title">
				<div className="mb-7 flex items-center justify-between gap-5 [&_h2]:text-[32px] [&_h2]:leading-[1.1] [&_h2]:tracking-[-0.7px] [&_p]:mb-2 max-[480px]:items-start max-[480px]:gap-3 max-[480px]:[&_p]:max-w-[140px] max-[480px]:[&_p]:text-[9px] max-[480px]:[&_button]:px-3.5">
					<div><p className="mb-3 text-[10px] font-extrabold tracking-[2.5px] text-[#6b704f] uppercase">The gathering place</p><h2 id="lobbies-title">Lobbies</h2></div>
					<LobbyCreate />
				</div>
				<LobbyList />
				<p className="mt-[26px] border-t border-[#d9d4bd] pt-5 text-center text-[11px] text-[#66705e]">Bring your best deck. Leave room for a little luck.</p>
			</section>
		</GamePage>
	);
};

export default LobbyPage;
