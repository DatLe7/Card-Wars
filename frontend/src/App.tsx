import { Routes, Route } from 'react-router';


import ProtectedRoute from './auth/protectedRoute';
import LobbyPage from './pages/lobby';
import Room from './pages/room';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import GamePage from './pages/game';

const App = () => {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route
				path="/room/:id"
				element={
					<ProtectedRoute>
						<Room />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/game"
				element={
					<ProtectedRoute>
						<GamePage />
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
