export type CardView = {
	instanceId: string;
	ownerId: string;
	cardId: string;
	name: string;
	type: 'building' | 'creature' | 'spell';
	land: string;
	cost: number;
	attack: number;
	defence: number;
	damage: number;
	atkMod: number;
	defMod: number;
	canFloop: boolean;
	isFlooped: boolean;
};

export type GameAction = {
	type: 'NEXT_TURN' | 'DRAW_CARD' | 'PLAY_CARD' | 'SELECT_BATTLE_LANE';
	playerId: string;
	cardInstanceId?: string;
	laneIndex?: number;
};

export type GameView = {
	id: string;
	name: string;
	decklist: {
		landscape: string[];
		deck: { cardId: string; count: number }[];
	};
	turn: {
		number: number;
		activePlayerId: string;
		phase: 'READY' | 'MAIN' | 'BATTLE';
	};
	game: {
		player: {
			life: number;
			actionPoints: number;
			deckCardCount: number;
			hand: CardView[];
			graveyard: CardView[];
			lands: {
				landscape: string;
				creature?: CardView;
				building?: CardView;
			}[];
		};
		enemy: {
			life: number;
			actionPoints: number;
			deckCardCount: number;
			handCardCount: number;
			graveyardCardCount: number;
			lands: {
				landscape: string;
				creature?: CardView;
				building?: CardView;
			}[];
		};
	};
	actions: GameAction[];
};
