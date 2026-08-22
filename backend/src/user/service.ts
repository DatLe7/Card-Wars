import type { PublicUser, User } from '.';
import { pool } from '../db';

interface UserRow {
  id: string;
  username: string;
}

export class UserService {
  public async create(user: User): Promise<PublicUser | null> {
    const { rows } = await pool.query<UserRow>({
      text: `
        INSERT INTO "user" (email, username, password)
        VALUES (
          lower($1),
          $2,
          crypt($3, gen_salt('bf'))
        )
        ON CONFLICT DO NOTHING
        RETURNING id, username;
      `,
      values: [user.email, user.username, user.password],
    });

    const created = rows[0];

    if (!created) {
      return null;
    }

    return {
      id: created.id,
      username: created.username,
    };
  }
}
