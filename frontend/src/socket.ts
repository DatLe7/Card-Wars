import { io } from 'socket.io-client';

export const socket = io('http://localhost:3012', {
  autoConnect: false,
	withCredentials: true,
});