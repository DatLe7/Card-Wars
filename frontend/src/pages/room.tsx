import Room from '../room/room';
import { useParams } from 'react-router';

const RoomPage = () => {
	const { id } = useParams<{ id: string }>();

	return (
		<div>
			<h1>Room: {id}</h1>
			<Room />
		</div>
	);
};

export default RoomPage;
