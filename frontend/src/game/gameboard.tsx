import { useEffect, useState } from 'react';

import { socket } from '../socket';
import type { CardView, GameAction, GameView } from '.';

type GameBoardProps = {
	gameId?: string;
	initialView?: GameView;
};

function actionLabel(action: GameAction, hand: CardView[]): string {
	switch (action.type) {
		case 'NEXT_TURN':
			return 'Next turn';
		case 'DRAW_CARD':
			return 'Draw card';
		case 'PLAY_CARD': {
			const card = hand.find((item) => item.instanceId === action.cardInstanceId);
			return `Play ${card?.name ?? 'card'} in lane ${(action.laneIndex ?? 0) + 1}`;
		}
		case 'SELECT_BATTLE_LANE':
			return `Battle in lane ${(action.laneIndex ?? 0) + 1}`;
	}
}

function Card({ card }: { card: CardView }) {
	return (
		<article className="min-w-36 rounded-xl border border-slate-200 bg-white p-3 shadow-sm" aria-label={card.name}>
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

function LifeTotal({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl bg-slate-50 px-4 py-3">
			<p className="text-xs font-medium text-slate-500">{label}</p>
			<output className="mt-1 block text-2xl font-semibold tabular-nums" aria-label={label}>{value}</output>
		</div>
	);
}

const GameBoard = ({ gameId, initialView }: GameBoardProps) => {
	const [view, setView] = useState<GameView | undefined>(initialView);

	useEffect(() => {
		const receiveGameState = (nextView: GameView) => setView(nextView);
		socket.on('game:state', receiveGameState);

		return () => {
			socket.off('game:state', receiveGameState);
		};
	}, []);

	if (!view) {
		return <p className="rounded-xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-600" role="status">Waiting for game state...</p>;
	}

	const isYourTurn = view.turn.activePlayerId === view.id;
	const sendAction = (action: GameAction) => {
		if (!gameId) return;
		socket.emit('game:action', { gameId, action });
	};

	return (
		<section className="space-y-6" aria-label="Game board">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Game board</h1>
					<p className="mt-1 text-sm text-slate-600">Turn {view.turn.number}</p>
					<p className="text-xs uppercase tracking-wide text-slate-500">{view.turn.phase.toLowerCase()} phase</p>
				</div>
				<p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700" role="status">
					{isYourTurn ? 'Your turn' : 'Opponent’s turn'}
				</p>
			</header>

			<div className="grid gap-3 sm:grid-cols-2">
				<section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4" aria-label="Your status">
					<h2 className="font-semibold">{view.name}</h2>
					<div className="mt-3 grid grid-cols-3 gap-2">
						<LifeTotal label="Your life" value={view.game.player.life} />
						<div className="rounded-xl bg-white px-3 py-3">
							<p className="text-xs font-medium text-slate-500">Action points</p>
							<p className="mt-1 text-lg font-semibold tabular-nums">{view.game.player.actionPoints}</p>
						</div>
						<div className="rounded-xl bg-white px-3 py-3">
							<p className="text-xs font-medium text-slate-500">Deck</p>
							<p className="mt-1 text-lg font-semibold tabular-nums">{view.game.player.deckCardCount}</p>
						</div>
					</div>
				</section>
				<section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label="Opponent status">
					<h2 className="font-semibold">Opponent</h2>
					<div className="mt-3 grid grid-cols-3 gap-2">
						<LifeTotal label="Opponent life" value={view.game.enemy.life} />
						<div className="rounded-xl bg-white px-3 py-3">
							<p className="text-xs font-medium text-slate-500">Hand</p>
							<p className="mt-1 text-lg font-semibold tabular-nums">{view.game.enemy.handCardCount}</p>
						</div>
						<div className="rounded-xl bg-white px-3 py-3">
							<p className="text-xs font-medium text-slate-500">Deck</p>
							<p className="mt-1 text-lg font-semibold tabular-nums">{view.game.enemy.deckCardCount}</p>
						</div>
					</div>
				</section>
			</div>

			<section className="space-y-3" aria-label="Battlefield">
				<h2 className="text-lg font-semibold">Battlefield</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					{view.game.enemy.lands.map((land, index) => (
						<div className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-3" key={`enemy-${index}`}>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opponent lane {index + 1} · {land.landscape}</p>
							{land.creature && <div className="mt-2"><Card card={land.creature} /></div>}
							{land.building && <div className="mt-2"><Card card={land.building} /></div>}
						</div>
					))}
					{view.game.player.lands.map((land, index) => (
						<div className="min-h-24 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3" key={`player-${index}`}>
							<p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">Your lane {index + 1} · {land.landscape}</p>
							{land.creature && <div className="mt-2"><Card card={land.creature} /></div>}
							{land.building && <div className="mt-2"><Card card={land.building} /></div>}
						</div>
					))}
				</div>
			</section>

			<section className="space-y-3" aria-label="Your hand">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-lg font-semibold">Your hand</h2>
					<span className="text-sm text-slate-500">{view.game.player.hand.length} cards</span>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{view.game.player.hand.map((card) => <Card card={card} key={card.instanceId} />)}
				</div>
			</section>

			<section className="flex flex-wrap gap-3" aria-label="Available actions">
				{view.actions.map((action, index) => (
					<button
						className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						key={`${action.type}-${action.laneIndex ?? ''}-${action.cardInstanceId ?? index}`}
						disabled={!gameId}
						onClick={() => sendAction(action)}
					>
						{actionLabel(action, view.game.player.hand)}
					</button>
				))}
			</section>
		</section>
	);
};

export default GameBoard;
