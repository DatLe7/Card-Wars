import { Email } from "../types"

export interface User {
	username: string, 
	email: Email, 
	password: string
}

export interface Credentials {
    email: Email,
    password: string
}

export interface Auth {
  id: string
}
