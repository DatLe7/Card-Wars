import { describe, expect, it } from 'vitest';
import { io } from 'socket.io-client';

import { signupRandomUser } from '../testutils';
import { server, socketUrl } from '../setup';

describe('WebSocket authentication', () => {
  it('connects with a valid auth token', async () => {
    const authCookie = await signupRandomUser(server);

    const socket = io(socketUrl, {
      extraHeaders: {
        Cookie: authCookie,
      },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('connect_error', reject);
    });

    expect(socket.connected).toBe(true);
    socket.disconnect();
  });

  it('rejects a connection without an auth token', async () => {
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    await new Promise<Error>((resolve) => {
      socket.once('connect_error', resolve);
    });

    expect(socket.connected).toBe(false);
    socket.disconnect();
  });
});
