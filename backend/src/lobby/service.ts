import { Lobby, LeaveLobbyResult } from '.';
import {SessionUser} from '../types/express';
import { pool } from '../db';
import { HttpError } from '../errors/httperror';

export class LobbyService {
  public async leave(
    lobbyId: string,
    user: SessionUser,
  ): Promise<LeaveLobbyResult> {
    const {rows: promotedRows} = await pool.query<Lobby>({
      text: `
        UPDATE lobby
        SET owner = lobby.player,
            player = NULL
        FROM "user" AS new_owner
        WHERE lobby.id = $1
          AND lobby.owner = $2
          AND lobby.player IS NOT NULL
          AND new_owner.id = lobby.player
        RETURNING
          lobby.id,
          lobby.name,
          new_owner.username AS owner,
          NULL::text AS player;
      `,
      values: [lobbyId, user.id],
    });

    if (promotedRows[0]) {
      return {
        kind: 'updated',
        lobby: promotedRows[0],
      };
    }

    const {rows: deletedRows} = await pool.query<{ id: string }>({
      text: `
        DELETE FROM lobby
        WHERE id = $1 AND owner = $2
        RETURNING id;
      `,
      values: [lobbyId, user.id],
    });

    if (deletedRows[0]) {
      return {
        kind: 'deleted',
        lobbyId: deletedRows[0].id,
      };
    }

    const {rows: updatedRows} = await pool.query<Lobby>({
      text: `
        UPDATE lobby
        SET player = NULL
        FROM "user" AS owner_user
        WHERE lobby.id = $1
          AND lobby.player = $2
          AND owner_user.id = lobby.owner
        RETURNING
          lobby.id,
          lobby.name,
          owner_user.username AS owner,
          NULL::text AS player;
      `,
      values: [lobbyId, user.id],
    });

    if (updatedRows[0]) {
      return {
        kind: 'updated',
        lobby: updatedRows[0],
      };
    }

    throw new HttpError(404, 'Lobby Not Found');
  }

  public async getForUser(
    lobbyId: string,
    user: SessionUser,
  ): Promise<Lobby> {
    const {rows} = await pool.query<Lobby>({
      text: `
        SELECT
          lobby.id,
          lobby.name,
          owner_user.username AS owner,
          player_user.username AS player
        FROM lobby
        JOIN "user" AS owner_user ON owner_user.id = lobby.owner
        LEFT JOIN "user" AS player_user ON player_user.id = lobby.player
        WHERE lobby.id = $1
          AND (lobby.owner = $2 OR lobby.player = $2);
      `,
      values: [lobbyId, user.id],
    });
    const lobby = rows[0];

    if (!lobby) {
      throw new HttpError(404, 'Lobby Not Found');
    }

    return lobby;
  }

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
        WITH deleted_lobby AS (
          DELETE FROM lobby
          WHERE owner = $2
        )
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
