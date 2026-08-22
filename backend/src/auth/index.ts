import { Email } from "../types"

export interface Credentials {
    email: Email,
    password: string
}

export interface Authenticated {
    id: string
}