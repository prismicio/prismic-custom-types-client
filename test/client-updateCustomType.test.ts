import { test, expect } from "vitest";
import * as msw from "msw";
import * as assert from "assert";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";

test("updates a Custom Type", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			new URL("./customtypes/update", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), customType);

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.updateCustomType(customType);

	expect(res).toStrictEqual(customType);
});

test("uses params if provided", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	ctx.server.use(
		msw.rest.post(
			new URL("./customtypes/update", params.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), customType);

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.updateCustomType(customType, params);

	expect(res).toStrictEqual(customType);
});

test("throws NotFoundError if a matching Custom Type was not found", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			new URL("./customtypes/update", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), customType);

				return res(ctx.status(422));
			},
		),
	);

	await expect(async () => {
		await client.updateCustomType(customType);
	}).rejects.toThrow(prismicCustomTypes.NotFoundError);
});

test("throws InvalidPayloadError if an invalid Custom Type is sent", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);
	const message = "[MOCK INVALID PAYLOAD ERROR]";

	ctx.server.use(
		msw.rest.post(
			new URL("./customtypes/update", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				// We force the API to return a 400 status code to simulate an invalid
				// payload error.
				return res(ctx.status(400), ctx.text(message));
			},
		),
	);

	await expect(async () => {
		await client.updateCustomType(customType);
	}).rejects.toThrow(prismicCustomTypes.InvalidPayloadError);
});

// TODO: This test fails for unknown reasons. The POST fetch request seems to
// throw outside the `async/await` instruction.
test.skip("is abortable", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);

	const controller = new AbortController();
	controller.abort();

	await expect(async () => {
		await client.updateCustomType(customType, { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});
