import { Routes, Route } from 'react-router';


import ProtectedRoute from './auth/protectedRoute';
import LobbyPage from './pages/lobby';
import Room from './pages/room';
import LoginPage from './pages/login';

const App = () => {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/room/:id"
				element={
					<ProtectedRoute>
						<Room />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<LobbyPage />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
};

export default App;
