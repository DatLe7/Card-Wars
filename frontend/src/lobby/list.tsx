import { useEffect, useState } from 'react'
import type { Lobby } from '.'
import LobbyListItem from './listItem'
import { getLobbies } from './model'

const LobbyList = () => {
	const [lobbies, setLobbies] = useState<Lobby[]>([])
	const [error, setError] = useState('')

	useEffect(() => {
		let active = true
		void getLobbies()
			.then((availableLobbies) => {
				/* v8 ignore next */
				if (active) setLobbies(availableLobbies)
			})
			.catch(() => {
				if (active) setError('Failed to load lobbies')
			})

		return () => { active = false }
	}, [])

	return (
		<div>
			{error && <div role="alert">{error}</div>}
			{lobbies.map((lobby) => (
				<LobbyListItem key={lobby.id} {...lobby} />
			))}
		</div>
	)
}

export default LobbyList
