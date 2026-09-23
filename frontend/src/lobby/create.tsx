import { useState } from 'react'
import { createLobby } from './model'

const LobbyCreate = () => {
	const [error, setError] = useState('')

	const handleCreate = async () => {
		try {
			// const lobby = 
			await createLobby()
		} catch (err) {
			setError((err as Error).message)
		}
	}

	return (
		<div>
			{error && <div role="alert">{error}</div>}
			<button onClick={handleCreate}>Create</button>
		</div>
	)
}

export default LobbyCreate