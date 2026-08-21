import { useEffect, useState } from 'react'
import type { Lobby } from '.'
import LobbyListItem from './listItem'
import { getLobbies } from './model'

const LobbyList = () => {
	const [lobbies, setLobbies] = useState<Lobby[]>([])

	useEffect(() => {
		void getLobbies().then((availableLobbies) => {
			setLobbies(availableLobbies ?? [])
		})
	}, [])

	return (
		<div>
			{lobbies.map((lobby) => (
				<LobbyListItem key={lobby.id} {...lobby} />
			))}
		</div>
	)
}

export default LobbyList
