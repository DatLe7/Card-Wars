import LobbyList from '@/lobby/list';
import LobbyCreate from '@/lobby/create';

const LobbyPage = () => {
	return (
		<div>
			Lobbies
			<LobbyCreate />
			<LobbyList />
		</div>
	);
};

export default LobbyPage;
