import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createClient } from "./__testutils__/createClient";
import { createSharedSlice } from "./__testutils__/createSharedSlice";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";
import { resolveURL } from "./__testutils__/resolveURL";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns a Shared Slice by ID", async (t) => {
	const sharedSlice = createSharedSlice();
	const client = createClient(t);

	server.use(
		msw.rest.get(
			resolveURL(client.endpoint, `/slices/${sharedSlice.id}`),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.json(sharedSlice));
			},
		),
	);

	const res = await client.getSharedSliceByID(sharedSlice.id);

	t.deepEqual(res, sharedSlice);
});

test("uses params if provided", async (t) => {
	const sharedSlice = createSharedSlice();
	const client = createClient(t);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	server.use(
		msw.rest.get(
			resolveURL(params.endpoint, `/slices/${sharedSlice.id}`),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.json(sharedSlice));
			},
		),
	);

	const res = await client.getSharedSliceByID(sharedSlice.id, params);

	t.deepEqual(res, sharedSlice);
});

test("throws NotFoundError if a matching Custom Type was not found", async (t) => {
	const sharedSlice = createSharedSlice();
	const client = createClient(t);

	server.use(
		msw.rest.get(
			resolveURL(client.endpoint, `/slices/${sharedSlice.id}`),
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
		async () => await client.getSharedSliceByID(sharedSlice.id),
		{
			instanceOf: prismicCustomTypes.NotFoundError,
		},
	);
});
