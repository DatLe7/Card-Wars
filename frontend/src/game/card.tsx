import type { CardView } from '.';

export default function Card({ card, inHand = false, location }: { card: CardView; inHand?: boolean; location?: string }) {
	return (
		<article
			className="min-w-36 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
			aria-label={inHand ? `${card.name} in your hand` : location ? `${card.name} on ${location}` : card.name}
			draggable={inHand}
			onDragStart={(event) => {
				if (!inHand) return;
				event.dataTransfer.setData('text/plain', card.instanceId);
			}}
		>
			<div className="flex items-start justify-between gap-2">
				<h3 className="font-semibold">{card.name}</h3>
				<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">{card.cost}</span>
			</div>
			<p className="mt-1 text-xs capitalize text-slate-500">{card.type} · {card.land}</p>
			{card.type === 'creature' && (
				<p className="mt-3 text-sm font-medium" aria-label={`${card.name} stats`}>
					{card.attack + card.atkMod} ATK · {card.defence + card.defMod - card.damage} DEF
				</p>
			)}
		</article>
	);
}
