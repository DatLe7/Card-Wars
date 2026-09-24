import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

const socketMocks = vi.hoisted(() => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    emitWithAck: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
    timeout: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: true,
  };

  return { mockSocket, io: vi.fn(() => mockSocket) };
});

vi.mock('socket.io-client', () => ({ io: socketMocks.io }));

export const { mockSocket, io } = socketMocks;

export const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  mockSocket.on.mockReset().mockReturnThis();
  mockSocket.off.mockReset().mockReturnThis();
  mockSocket.emit.mockReset().mockReturnThis();
  mockSocket.emitWithAck.mockReset();
  mockSocket.timeout.mockReset().mockReturnThis();
  mockSocket.connect.mockReset().mockReturnThis();
  mockSocket.disconnect.mockReset().mockReturnThis();
  mockSocket.connected = true;
  io.mockClear();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
