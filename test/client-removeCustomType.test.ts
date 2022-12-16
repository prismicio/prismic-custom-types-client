import { test, expect } from "vitest";
import * as msw from "msw";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";

test("removes a Custom Type", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.delete(
			new URL(`customtypes/${customType.id}`, client.endpoint).toString(),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.removeCustomType(customType.id);

	expect(res).toBe(customType.id);
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
		msw.rest.delete(
			new URL(`customtypes/${customType.id}`, params.endpoint).toString(),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.removeCustomType(customType.id, params);

	expect(res).toBe(customType.id);
});

test("is abortable", async (ctx) => {
	const client = createClient(ctx);

	const controller = new AbortController();
	controller.abort();

	await expect(async () => {
		await client.removeCustomType("id", { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

// NOTE: The API does not return a 4xx status code if a non-existing Custom Type
// is deleted. Instead, it returns 204 just like a successful deletion request.
// As a result, we have nothing to test.
//
// Leave this comment to document the reasoning why no test exists for this case.
// test.todo("throws NotFoundError if a matching Custom Type was not found");
