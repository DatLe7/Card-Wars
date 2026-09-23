const LobbyCreate = () => {
	return (
		<form>
			<label htmlFor="lobbyname">Lobby Name</label>
			<input
				id="lobbyname"
				name="lobbyname"
				placeholder="Enter Lobby Name"
			/>
			<button type="submit">Create</button>
		</form>
	)
}

export default LobbyCreate