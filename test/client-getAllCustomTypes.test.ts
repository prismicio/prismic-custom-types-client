import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createClient } from "./__testutils__/createClient";
import { createCustomType } from "./__testutils__/createCustomType";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all Custom Types", async (t) => {
	const queryResponse = [createCustomType()];
	const client = createClient(t);

	server.use(
		msw.rest.get(client.endpoint, (req, res, ctx) => {
			if (!isAuthorizedRequest(client, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			return res(ctx.json(queryResponse));
		}),
	);

	const res = await client.getAllCustomTypes();

	t.deepEqual(res, queryResponse);
});

test("uses params if provided", async (t) => {
	const queryResponse = [createCustomType()];
	const client = createClient(t);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	server.use(
		msw.rest.get(params.endpoint, (req, res, ctx) => {
			if (!isAuthorizedRequest(params, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			return res(ctx.json(queryResponse));
		}),
	);

	const res = await client.getAllCustomTypes(params);

	t.deepEqual(res, queryResponse);
});
