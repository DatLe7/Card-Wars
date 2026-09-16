export async function signup(
  username: string,
  email: string,
  password: string,
): Promise<string> {
  const response = await fetch('/api/v0/auth/signup', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, email, password }),
	})

  if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return 'User Created'
}

export async function login(
	identifier: string,
	password: string
): Promise<string> {
	const response = await fetch('/api/v0/auth/login', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier, password }),
	})

  if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return 'Logged In'
}