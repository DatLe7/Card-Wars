import { Lobby } from '.';
import {SessionUser} from '../types/express';
import { pool } from '../db';
import { HttpError } from '../errors/httperror';

export class LobbyService {
  public async getAll(user: SessionUser): Promise<Lobby[]> {
    const {rows} = await pool.query({
      text: `
        SELECT
          lobby.id,
          lobby.name,
          "user".username AS owner,
          lobby.player
        FROM lobby
        JOIN "user" ON "user".id = lobby.owner
        WHERE lobby.owner <> $1
        ORDER BY lobby.created_at;
      `,
      values: [user.id],
    });

    return rows;
  }

  public async create(user: SessionUser): Promise<Lobby> {
    const {rows} = await pool.query({
      text: `
        INSERT INTO lobby (name, owner)
        VALUES ($1, $2)
        RETURNING id, name, player;
      `,
      values: [`${user.name}'s lobby`, user.id],
    });
    const lobby = rows[0];

    return {
      id: lobby.id,
      name: lobby.name,
      owner: user.name,
      player: lobby.player,
    };
  }

  public async join(lobbyId: string, user: SessionUser): Promise<Lobby> {
    const {rows: stateRows} = await pool.query({
      text: `
        SELECT
          EXISTS(SELECT 1 FROM lobby WHERE id = $2) AS exists,
          EXISTS(SELECT 1 FROM lobby WHERE id = $2 AND owner = $1) AS is_owner,
          EXISTS(SELECT 1 FROM lobby WHERE id = $2 AND player IS NOT NULL) AS is_full,
          EXISTS(SELECT 1 FROM lobby WHERE player = $1) AS already_in_lobby,
          EXISTS(
            SELECT 1 FROM lobby WHERE owner = $1 AND id <> $2
          ) AS owns_another_lobby;
      `,
      values: [user.id, lobbyId],
    });
    const state = stateRows[0];

    if (!state.exists || state.is_owner || state.is_full) {
      throw new HttpError(404, 'Lobby Not Found')
    }

    if (state.already_in_lobby || state.owns_another_lobby) {
      throw new HttpError(409, 'User Already Associated With Another Lobby')
    }

    const {rows} = await pool.query({
      text: `
        UPDATE lobby
        SET player = $1
        FROM "user" AS owner_user, "user" AS player_user
        WHERE lobby.id = $2
          AND lobby.player IS NULL
          AND lobby.owner <> $1
          AND NOT EXISTS (SELECT 1 FROM lobby AS joined WHERE joined.player = $1)
          AND NOT EXISTS (
            SELECT 1 FROM lobby AS owned WHERE owned.owner = $1 AND owned.id <> $2
          )
          AND owner_user.id = lobby.owner
          AND player_user.id = $1
        RETURNING
          lobby.id,
          lobby.name,
          owner_user.username AS owner,
          player_user.username AS player;
      `,
      values: [user.id, lobbyId],
    });

    return rows[0];
  }
}
