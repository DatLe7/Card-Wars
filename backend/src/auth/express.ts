import { Request } from 'express';
import { AuthService } from './service';
import { SessionUser } from '../types/express';

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[],
): Promise<SessionUser> {
  void securityName;
  return new AuthService().check(request, scopes);
}
