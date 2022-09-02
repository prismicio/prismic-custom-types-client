import { test, expect } from "vitest";
import * as msw from "msw";
import * as assert from "assert";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";
import { resolveURL } from "./__testutils__/resolveURL";

test("inserts a Shared Slice", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			resolveURL(client.endpoint, "/slices/insert"),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				return res(ctx.status(201));
			},
		),
	);

	const res = await client.insertSharedSlice(sharedSlice);

	expect(res).toStrictEqual(sharedSlice);
});

test("uses params if provided", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	ctx.server.use(
		msw.rest.post(
			resolveURL(params.endpoint, "/slices/insert"),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				return res(ctx.status(201));
			},
		),
	);

	const res = await client.insertSharedSlice(sharedSlice, params);

	expect(res).toStrictEqual(sharedSlice);
});

test("throws ConflictError if a Custom Type with the same ID already exists", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			resolveURL(client.endpoint, "/slices/insert"),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				return res(ctx.status(409));
			},
		),
	);

	await expect(async () => {
		await client.insertSharedSlice(sharedSlice);
	}).rejects.toThrow(prismicCustomTypes.ConflictError);
});

test("throws InvalidPayloadError if an invalid Shared Slice is sent", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);
	const message = "[MOCK INVALID PAYLOAD ERROR]";

	ctx.server.use(
		msw.rest.post(
			resolveURL(client.endpoint, "/slices/insert"),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				// We force the API to return a 400 status code to simulate an invalid
				// payload error.
				return res(ctx.status(400), ctx.text(message));
			},
		),
	);

	await expect(async () => {
		await client.insertSharedSlice(sharedSlice);
	}).rejects.toThrow(prismicCustomTypes.InvalidPayloadError);
});

// TODO: This test fails for unknown reasons. The POST fetch request seems to
// throw outside the `async/await` instruction.
test.skip("is abortable", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	const controller = new AbortController();
	controller.abort();

	await expect(async () => {
		await client.insertSharedSlice(sharedSlice, { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});
