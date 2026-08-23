import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { pool } from '../db';
import { Authenticated, LoginRequest, SignupRequest } from '.';
import { SessionUser } from '../types/express';

const JWT_ALGORITHM = 'HS256';

interface UserRow {
  id: string;
}

export class AuthService {
  public async check(request: Request, scopes: string[]): Promise<SessionUser> {
    void scopes;
    const token = request.cookies?.authToken;

    if (typeof token !== 'string') {
      throw new AuthenticationError();
    }

    const authenticated = verifyJwt(token);

    if (!authenticated) {
      throw new AuthenticationError();
    }

    const user: SessionUser = {id: authenticated.id};
    request.user = user;

    return user;
  }

  public async signup(user: SignupRequest): Promise<Authenticated | null> {
    const { rows } = await pool.query<UserRow>({
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

    return rows[0] ?? null;
  }

  public async login(credentials: LoginRequest): Promise<Authenticated | null> {
    const { rows } = await pool.query<UserRow>({
      text: `
        SELECT id FROM "user"
        WHERE email = lower($1)
        AND pwhash = crypt($2, pwhash);
      `,
      values: [credentials.email, credentials.password],
    });

    return rows[0] ?? null;
  }
}

export class AuthenticationError extends Error {
  public readonly status = 401;

  public constructor() {
    super('Authentication required');
  }
}

function getJwtSecret(): string {
  const secret = process.env.SECRET;

  if (!secret) {
    throw new Error('SECRET environment variable is required');
  }

  return secret;
}

export function createJwt(userId: string): string {
  return jwt.sign(
    { id: userId },
    getJwtSecret(),
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: '30m',
    },
  );
}

export function verifyJwt(token: string): Authenticated | undefined {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    });

    if (typeof payload === 'string' || typeof payload.id !== 'string') {
      return undefined;
    }

    return { id: payload.id };
  } catch {
    return undefined;
  }
}
