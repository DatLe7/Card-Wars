/* v8 ignore file */
import { useParams } from 'react-router'

const Room = () => {
	const { id } = useParams<{ id: string }>()

	return <h1>Room {id}</h1>
}

export default Room
