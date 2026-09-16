export async function signup(
  username: string,
  email: string,
  password: string,
): Promise<boolean> {
  const response = await fetch('/api/v0/auth/signup', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    return false
  }

	return true
}