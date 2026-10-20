import Room from '../room/room';
import { useParams } from 'react-router';
import GamePage from './gamePage';

const RoomPage = () => {
	const { id } = useParams<{ id: string }>();

	return (
		<GamePage layout="wide">
			<section className="rounded-[18px] border border-[#e4dac0] bg-[linear-gradient(145deg,#fffbee,#eee9d5)] text-[#24382e] shadow-[0_24px_80px_#0000004d,inset_0_0_0_5px_#ffffff59] max-[480px]:rounded-xl p-8 max-[480px]:px-5 max-[480px]:py-[26px]">
				<p className="mb-6 text-[11px] wrap-anywhere text-[#66705e]">Room: {id}</p>
				<Room />
			</section>
		</GamePage>
	);
};

export default RoomPage;
