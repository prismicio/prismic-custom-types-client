import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createClient } from "./__testutils__/createClient";
import { createCustomType } from "./__testutils__/createCustomType";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";
import { resolveURL } from "./__testutils__/resolveURL";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns a Custom Type by ID", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);

	server.use(
		msw.rest.get(
			resolveURL(client.endpoint, customType.id),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.json(customType));
			},
		),
	);

	const res = await client.getCustomTypeByID(customType.id);

	t.deepEqual(res, customType);
});

test("uses params if provided", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	server.use(
		msw.rest.get(
			resolveURL(params.endpoint, customType.id),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.json(customType));
			},
		),
	);

	const res = await client.getCustomTypeByID(customType.id, params);

	t.deepEqual(res, customType);
});

test("throws NotFoundError if a matching Custom Type was not found", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);

	server.use(
		msw.rest.get(
			resolveURL(client.endpoint, customType.id),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.status(404));
			},
		),
	);

	await t.throwsAsync(
		async () => await client.getCustomTypeByID(customType.id),
		{
			instanceOf: prismicCustomTypes.NotFoundError,
		},
	);
});
