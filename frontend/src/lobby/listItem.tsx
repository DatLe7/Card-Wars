import { useState } from 'react'
import { joinLobby } from './model'

interface LobbyListItemProps {
	name: string
	id: string
}

function LobbyListItem({ name, id }: LobbyListItemProps) {
	const [joinFailed, setJoinFailed] = useState(false)

	async function handleJoin() {
		const joined = await joinLobby(id)
		setJoinFailed(!joined)
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => void handleJoin()}
				aria-live="polite"
			>
				{joinFailed ? 'Failed to join lobby' : name}
			</button>
		</div>
	)
}

export default LobbyListItem
