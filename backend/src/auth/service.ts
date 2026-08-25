import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { pool } from '../db';
import { Authenticated, LoginRequest, SignupRequest } from '.';
import { SessionUser } from '../types/express';
import { HttpError } from '../errors/httperror';

const JWT_ALGORITHM = 'HS256';

const secret = process.env.SECRET as string;

export class AuthService {
  public async check(request: Request, scopes: string[]): Promise<SessionUser> {
    void scopes;
    const token = request.cookies?.authToken;

    const user = await this.verify(token);

    request.user = user;

    return user;
  }

  public async verify(token: unknown): Promise<SessionUser> {
    if (typeof token !== 'string') {
      throw new HttpError(401, 'Authentication required');
    }

    const authenticated = verifyJwt(token);

    const {rows} = await pool.query<SessionUser>({
      text: `
        SELECT id, username AS name
        FROM "user"
        WHERE id = $1;
      `,
      values: [authenticated.id],
    });
    const user = rows[0];

    if (!user) {
      throw new HttpError(401, 'Authentication required');
    }

    return user;
  }

  public async signup(user: SignupRequest): Promise<Authenticated> {
    const { rows } = await pool.query({
      text: `
        INSERT INTO "user" (email, username, pwhash)
        VALUES (
          lower($1),
          $2,
          crypt($3, gen_salt('bf'))
        )
        ON CONFLICT DO NOTHING
        RETURNING id;
      `,
      values: [user.email, user.username, user.password],
    });

    if (!rows[0]) {
      throw new HttpError(409, 'Email in use')
    }

    return rows[0];
  }

  public async login(credentials: LoginRequest): Promise<Authenticated> {
    const { rows } = await pool.query({
      text: `
        SELECT id FROM "user"
        WHERE email = lower($1)
        AND pwhash = crypt($2, pwhash);
      `,
      values: [credentials.email, credentials.password],
    });

    if (!rows[0]) {
      throw new HttpError(401, 'Bad credentials')
    }

    return rows[0];
  }
}

export function createJwt(userId: string): string {
  return jwt.sign(
    { id: userId },
    secret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: '30m',
    },
  );
}

export function verifyJwt(token: string): Authenticated {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });

    if (typeof payload === 'string' || typeof payload.id !== 'string') {
      throw new HttpError(401, 'Authentication required');
    }

    return { id: payload.id };
  } catch {
    throw new HttpError(401, 'Authentication required');
  }
}
