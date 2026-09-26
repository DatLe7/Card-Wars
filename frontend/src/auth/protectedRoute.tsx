import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';

import { UserContext } from '../context/userContext';
import { check } from './model';
import { SessionUser } from '.';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<SessionUser | null>(null);

	useEffect(() => {
		const run = async () => {
			try {
				const session = await check();
				setUser(session);
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		run();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return (
		<UserContext.Provider value={user}>
			{children}
		</UserContext.Provider>
	);
};

export default ProtectedRoute;