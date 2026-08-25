import type { ExtendedError, Socket } from 'socket.io';
import { parse } from 'cookie';
import { AuthService } from '../../auth/service';

export async function socketAuth(
  socket: Socket,
  next: (error?: ExtendedError) => void,
): Promise<void> {
  try {
    const cookies = parse(socket.handshake.headers.cookie ?? '');
    const token = cookies.authToken;

    const user = await new AuthService().verify(token);

    socket.data.user = user;

    next();
  } catch {
    next(new Error('Unauthorized'));
  }
}
