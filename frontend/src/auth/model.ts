import { SessionUser } from '.';

export async function signup(
  username: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch('/api/v0/auth/signup', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email, password }),
	});

  if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message);
	}

	return 'User Created';
}

export async function login(
	identifier: string,
	password: string
): Promise<string> {
	const res = await fetch('/api/v0/auth/login', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier, password }),
	});

  if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message);
	}

	return 'Logged In';
}

export async function check(): Promise<SessionUser> {
  const res = await fetch('/api/v0/auth/me', {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}