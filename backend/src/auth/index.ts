import { Email } from '../types';

export interface SignupRequest {
  username: string;
  email: Email;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface Authenticated {
  id: string;
}
