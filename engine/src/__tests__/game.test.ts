import { beforeEach, describe, expect, it } from 'vitest';

import finnDecklist from '../data/finn.json';
import jakeDecklist from '../data/jake.json';
import type { Deck } from '../game';
import { Game } from '../game/game.js';


describe('create game', () => {
  let game: Game;
  beforeEach(() => {
    game = new Game({
      gameId: 'game_123',
      players: [
        {
          id: 'p1',
          name: 'Me',
          decklist: jakeDecklist as Deck,
        },
        {
          id: 'p2',
          name: 'Opponent',
          decklist: finnDecklist as Deck,
        }
      ],
      firstPlayer: 'p1',
    });
  });
  it('returns object', () => {
    expect(game).not.toBeUndefined();
  });

  it('assigns the correct player information', () => {
    const view = game.getPlayerView('p1');
    expect(view.id).toBe('p1');
  });

  it('assigns the correct player name', () => {
    const view = game.getPlayerView('p1');
    expect(view.name).toBe('Me');
  });

  it('throws when getting information for a non-player', () => {
    expect(() => game.getPlayerView('p3')).toThrow(
      'Player p3 was not found in this game.',
    );
  });

  it('starts in the first turn', () => {
    const view = game.getPlayerView('p1');
    expect(view.turn.number).toBe(1);
  });
  it('correct starting player', () => {
    const view = game.getPlayerView('p1');
    expect(view.turn.activePlayerId).toBe('p1');
  });
  it('correct starting player from opponent view', () => {
    const view = game.getPlayerView('p2');
    expect(view.turn.activePlayerId).toBe('p1');
  });
  it('correct starting phase', () => {
    const view = game.getPlayerView('p1');
    expect(view.turn.phase).toBe('READY');
  });
});

// describe('READY', () => {
//   let game: Game;
//   beforeEach(() => {
//     game = new Game({
//       gameId: 'game_321',
//       players: [
//         {
//           id: 'p1',
//           name: 'Player 1',
//           decklist: jakeDecklist as Deck,
//         },
//         {
//           id: 'p2',
//           name: 'Player 2',
//           decklist: finnDecklist as Deck,
//         }
//       ],
//       firstPlayer: 'p1',
//     });
//   });
//   it('5 cards initially in hand', () => {
//     const view = game.getPlayerView('p1');
//     expect(view.game.hand.length).toBe(5);
//   });
// });
