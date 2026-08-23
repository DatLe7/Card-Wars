import { Lobby } from '.';
import {SessionUser} from '../types/express';
import { pool } from '../db';

interface LobbyRow {
  id: string;
  name: string;
  owner: string;
  player: string | null;
}

export class LobbyService {
  public async getAll(user: SessionUser): Promise<Lobby[]> {
    const {rows} = await pool.query<LobbyRow>({
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
    const {rows} = await pool.query<LobbyRow>({
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
}
