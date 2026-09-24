import { useParams } from 'react-router';

const RoomPage = () => {
	const { id } = useParams<{ id: string }>();

	return <h1>Room: {id}</h1>;
};

export default RoomPage;
