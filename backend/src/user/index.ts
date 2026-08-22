import { Email } from "../types"

export interface User {
	username: string, 
	email: Email, 
	password: string
}

export interface PublicUser {
  id: string
  username: string
}
