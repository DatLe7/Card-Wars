import { useState } from 'react';
import { createLobby } from './model';
import { useNavigate } from 'react-router';

const LobbyCreate = () => {
	const navigate = useNavigate();

	const [error, setError] = useState('');

	const handleCreate = async () => {
		try {
			const lobby = await createLobby();
			navigate(`/room/${lobby.id}`);
		} catch (err) {
			setError((err as Error).message);
		}
	};

	return (
		<div className="max-w-1/2 text-right">
			{error && <div className="mb-4 rounded-[7px] border border-[#d8ae96] bg-[#fae9da] px-3.5 py-3 text-[13px] wrap-anywhere text-[#853a2d]" role="alert">{error}</div>}
			<button className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-3 rounded-[7px] border px-6 py-3 text-[13px] leading-[1.4] font-bold transition-[background,transform,box-shadow] duration-150 border-[#244932] bg-[#2f543b] text-[#fff8df] shadow-[0_3px_0_#203b2a] hover:-translate-y-px hover:bg-[#3c6849] active:translate-y-px active:shadow-[0_1px_0_#203b2a]" onClick={handleCreate}><span aria-hidden="true">＋ </span>Create</button>
		</div>
	);
};

export default LobbyCreate;
