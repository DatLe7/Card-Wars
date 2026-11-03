import type { LobbyUser } from '../lobby';

interface PlayerSeatProps {
	player: LobbyUser;
	label: string;
	number: string;
}

const PlayerSeat = ({ player, label, number }: PlayerSeatProps) => (
	<article className="group min-w-0 rounded-xl bg-emerald-50 p-5 text-center data-[deck=jake]:bg-amber-50" data-deck={player.deck}>
		<div className="flex items-center justify-between text-xs text-slate-600">
			<span className="font-medium">{label}</span>
			<span>{number}</span>
		</div>
		<div className="mx-auto my-5 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800 group-data-[deck=jake]:bg-amber-100 group-data-[deck=jake]:text-amber-800">
			<svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
				<circle cx="12" cy="8" r="4" />
				<path d="M4 21v-2a8 8 0 0 1 16 0v2" />
			</svg>
		</div>
		<dl>
			<dt className="sr-only">{label} name</dt>
			<dd className="mb-4 text-lg font-semibold wrap-anywhere" aria-label={`${label} name`}>{player.name ?? 'Waiting for a challenger'}</dd>
			<dt className="text-xs text-slate-600">Selected deck</dt>
			<dd className="mt-1 text-sm font-medium capitalize" aria-label={`${label} deck`}>{player.deck}</dd>
		</dl>
	</article>
);

export default PlayerSeat;
