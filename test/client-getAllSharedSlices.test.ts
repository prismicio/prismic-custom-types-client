import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createClient } from "./__testutils__/createClient";
import { createSharedSlice } from "./__testutils__/createSharedSlice";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";
import { resolveURL } from "./__testutils__/resolveURL";

import * as prismicCustomTypes from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all Shared Slices", async (t) => {
	const queryResponse = [createSharedSlice()];
	const client = createClient(t);

	server.use(
		msw.rest.get(resolveURL(client.endpoint, "slices"), (req, res, ctx) => {
			if (!isAuthorizedRequest(client, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			return res(ctx.json(queryResponse));
		}),
	);

	const res = await client.getAllSharedSlices();

	t.deepEqual(res, queryResponse);
});

test("uses params if provided", async (t) => {
	const queryResponse = [createSharedSlice()];
	const client = createClient(t);
	const params: Required<prismicCustomTypes.CustomTypesAPIParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	server.use(
		msw.rest.get(resolveURL(params.endpoint, "slices"), (req, res, ctx) => {
			if (!isAuthorizedRequest(params, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			return res(ctx.json(queryResponse));
		}),
	);

	const res = await client.getAllSharedSlices(params);

	t.deepEqual(res, queryResponse);
});
