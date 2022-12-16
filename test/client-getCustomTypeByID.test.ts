import { test, expect } from "vitest";
import * as msw from "msw";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";

test("returns a Custom Type by ID", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(
			new URL(`customtypes/${customType.id}`, client.endpoint).toString(),
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
		msw.rest.get(
			new URL(`customtypes/${customType.id}`, params.endpoint).toString(),
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

	expect(res).toStrictEqual(customType);
});

test("throws NotFoundError if a matching Custom Type was not found", async (ctx) => {
	const customType = ctx.mock.model.customType();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(
			new URL(`customtypes/${customType.id}`, client.endpoint).toString(),
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

	await expect(async () => {
		await client.getCustomTypeByID(customType.id);
	}).rejects.toThrow(prismicCustomTypes.NotFoundError);
});

test("is abortable", async (ctx) => {
	const controller = new AbortController();
	controller.abort();

	const client = createClient(ctx);

	await expect(async () => {
		await client.getCustomTypeByID("id", { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});
