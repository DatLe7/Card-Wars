import { createContext } from 'react';
import type { SessionUser } from '../auth';

export const UserContext = createContext<SessionUser | null>(null);