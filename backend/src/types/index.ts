/**
 * @minLength 180
 * @maxLength 540
 * @pattern ^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$
 */
export type Midt = string

/**
 * @format email
 * @pattern ^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$
 */
export type Email = string;
