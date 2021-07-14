import test from "ava";
import * as assert from "assert";
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

test("inserts a Shared Slice", async (t) => {
	const sharedSlice = createSharedSlice();
	const client = createClient(t);

	server.use(
		msw.rest.post(
			resolveURL(client.endpoint, "/slices/insert"),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(req.body, sharedSlice);

				return res(ctx.status(201));
			},
		),
	);

	const res = await client.insertSharedSlice(sharedSlice);

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
		msw.rest.post(
			resolveURL(params.endpoint, "/slices/insert"),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(req.body, sharedSlice);

				return res(ctx.status(201));
			},
		),
	);

	const res = await client.insertSharedSlice(sharedSlice, params);

	t.deepEqual(res, sharedSlice);
});

test("throws ConflictError if a Custom Type with the same ID already exists", async (t) => {
	const sharedSlice = createSharedSlice();
	const client = createClient(t);

	server.use(
		msw.rest.post(
			resolveURL(client.endpoint, "/slices/insert"),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(req.body, sharedSlice);

				return res(ctx.status(409));
			},
		),
	);

	await t.throwsAsync(async () => await client.insertSharedSlice(sharedSlice), {
		instanceOf: prismicCustomTypes.ConflictError,
	});
});

test("throws InvalidPayloadError if an invalid Shared Slice is sent", async (t) => {
	const sharedSlice = createSharedSlice();
	const client = createClient(t);
	const message = "[MOCK INVALID PAYLOAD ERROR]";

	server.use(
		msw.rest.post(
			resolveURL(client.endpoint, "/slices/insert"),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(req.body, sharedSlice);

				// We force the API to return a 400 status code to simulate an invalid
				// payload error.
				return res(ctx.status(400), ctx.text(message));
			},
		),
	);

	await t.throwsAsync(async () => await client.insertSharedSlice(sharedSlice), {
		instanceOf: prismicCustomTypes.InvalidPayloadError,
		message,
	});
});
