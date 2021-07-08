export const createAuthorizationHeader = (token: string): string =>
	`Bearer ${token}`;
