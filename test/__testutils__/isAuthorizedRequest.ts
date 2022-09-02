import * as msw from "msw";

interface ClientLike {
	repositoryName: string;
	token: string;
}

export const isAuthorizedRequest = (
	client: ClientLike,
	req: msw.RestRequest,
): boolean => {
	return (
		req.headers.get("Authorization") === `Bearer ${client.token}` &&
		req.headers.get("repository") === client.repositoryName
	);
};
