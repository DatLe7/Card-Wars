export interface User {
	username: string, 
	/**
	 * @format email
	 */
	email: string, 
	password: string
}

export interface PublicUser {
  id: string
  username: string
}
