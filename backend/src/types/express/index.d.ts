import { UUID } from '..';

export interface SessionUser {
  id: UUID;
  name: string;
}

declare global {
  namespace Express {
    export interface Request {
      user: SessionUser;
    }
  }
}
