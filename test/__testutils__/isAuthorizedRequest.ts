import * as msw from "msw";

import { createAuthorizationHeader } from "./createAuthorizationHeader";

interface ClientLike {
	repositoryName: string;
	token: string;
}

export const isAuthorizedRequest = (
	client: ClientLike,
	req: msw.RestRequest,
): boolean => {
	return (
		req.headers.get("Authorization") ===
			createAuthorizationHeader(client.token) &&
		req.headers.get("repository") === client.repositoryName
	);
};
