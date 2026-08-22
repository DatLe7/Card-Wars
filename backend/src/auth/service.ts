import jwt from 'jsonwebtoken';
import { Authenticated } from '.'

const JWT_ALGORITHM = 'HS256';

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
