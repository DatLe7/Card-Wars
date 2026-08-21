import { useState } from 'react'
import { joinLobby } from './model'

import { Lobby } from '.'

function LobbyListItem({ name, id }: Lobby) {
	const [joinFailed, setJoinFailed] = useState(false)

	async function handleJoin() {
		const joined = await joinLobby(id)
		setJoinFailed(!joined)
	}

	return (
		<button
			type="button"
			onClick={() => void handleJoin()}
		>
			{joinFailed ? 'Failed to join lobby' : name}
		</button>
	)
}

export default LobbyListItem
