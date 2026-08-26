import { io, type Socket } from 'socket.io-client';

export async function connectSocket(
  socketUrl: string,
  authCookie: string,
): Promise<Socket> {
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

  return socket;
}
