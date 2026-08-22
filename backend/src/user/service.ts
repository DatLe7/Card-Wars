import type { Auth, User, Credentials } from '.';
import { pool } from '../db';

interface UserRow {
  id: string;
  username: string;
}

export class UserService {
  public async signup(user: User): Promise<Auth | null> {
    const { rows: created } = await pool.query<UserRow>({
      text: `
        INSERT INTO "user" (email, username, pwhash)
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

    if (!created[0]) {
      return null;
    }

    return {
      id: created[0].id
    };
  }

  public async login(creds: Credentials): Promise<Auth | null> {
    const { rows: user } = await pool.query({
      text: `
			SELECT id FROM "user"
			WHERE email = $1
			AND pwhash = crypt($2, pwhash);
			`,
      values: [creds.email, creds.password]
    })
    if (!user) {
      return null
    }

    return user[0]
  }
}
