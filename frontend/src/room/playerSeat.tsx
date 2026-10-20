import type { LobbyUser } from '../lobby';

interface PlayerSeatProps {
	player: LobbyUser;
	label: string;
	number: string;
}

const PlayerSeat = ({ player, label, number }: PlayerSeatProps) => (
	<article className="group min-w-0 self-stretch rounded-xl border border-[#c7d6d1] bg-[linear-gradient(150deg,#e1ece7,#f4f5e9)] p-[22px] text-center data-[deck=jake]:border-[#dec894] data-[deck=jake]:bg-[linear-gradient(150deg,#f0dcaa,#faf4df)] max-[480px]:p-5" data-deck={player.deck}>
		<div className="flex items-center justify-between [&>span:first-child]:mb-0"><span className="mb-3 text-[10px] font-extrabold tracking-[2.5px] text-[#6b704f] uppercase">{label}</span><span className="text-[11px] text-[#778270]">{number}</span></div>
		<div className="mx-auto my-6 grid h-[92px] w-[72px] -rotate-7 place-items-center rounded-[9px] border-4 border-double border-[#a0bdb0] bg-[#315a50] font-[Georgia,serif] text-[42px] leading-normal font-bold text-[#fff6d9] shadow-[6px_6px_0_#c2d3c8] group-data-[deck=jake]:rotate-7 group-data-[deck=jake]:border-[#f0ce73] group-data-[deck=jake]:bg-[#9e6b25] group-data-[deck=jake]:shadow-[6px_6px_0_#e1cb94] max-[480px]:my-[18px]" aria-hidden="true">{player.deck.slice(0, 1).toUpperCase()}</div>
		<dl>
			<dt className="sr-only">{label} name</dt>
			<dd className="min-h-12 text-lg font-bold wrap-anywhere max-[480px]:mb-3 max-[480px]:min-h-0" aria-label={`${label} name`}>{player.name ?? 'Waiting for a challenger'}</dd>
			<dt className="text-[10px] tracking-[1.3px] text-[#66705e] uppercase">Selected deck</dt>
			<dd className="pt-1 text-sm capitalize" aria-label={`${label} deck`}>{player.deck}</dd>
		</dl>
	</article>
);

export default PlayerSeat;
