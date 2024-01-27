import { expect, test } from "vitest";

import * as prismic from "@prismicio/client";
import * as assert from "assert";
import * as msw from "msw";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import * as prismicCustomTypes from "../src";

test("updates a Custom Type", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			new URL("./slices/update", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.updateSharedSlice(sharedSlice);

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
			new URL("./slices/update", params.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.updateSharedSlice(sharedSlice, params);

	expect(res).toStrictEqual(sharedSlice);
});

test("throws NotFoundError if a matching Custom Type was not found", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			new URL("./slices/update", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), sharedSlice);

				return res(ctx.status(422));
			},
		),
	);

	await expect(async () => {
		await client.updateSharedSlice(sharedSlice);
	}).rejects.toThrow(prismicCustomTypes.NotFoundError);
});

test("throws InvalidPayloadError if an invalid Shared Slice is sent", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);
	const message = "[MOCK INVALID PAYLOAD ERROR]";

	ctx.server.use(
		msw.rest.post(
			new URL("./slices/update", client.endpoint).toString(),
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
		await client.updateSharedSlice(sharedSlice);
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
		await client.updateSharedSlice(sharedSlice, { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices/update", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) =>
		client.updateSharedSlice({} as prismic.SharedSliceModel, params),
});
