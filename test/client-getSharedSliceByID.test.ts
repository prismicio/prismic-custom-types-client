import { test, expect } from "vitest";
import * as msw from "msw";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import * as prismicCustomTypes from "../src";

test("returns a Shared Slice by ID", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(
			new URL(`./slices/${sharedSlice.id}`, client.endpoint).toString(),
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
		msw.rest.get(
			new URL(`./slices/${sharedSlice.id}`, params.endpoint).toString(),
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

	expect(res).toStrictEqual(sharedSlice);
});

test("throws NotFoundError if a matching Custom Type was not found", async (ctx) => {
	const sharedSlice = ctx.mock.model.sharedSlice();
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(
			new URL(`./slices/${sharedSlice.id}`, client.endpoint).toString(),
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
		await client.getSharedSliceByID(sharedSlice.id);
	}).rejects.toThrow(prismicCustomTypes.NotFoundError);
});

test("is abortable", async (ctx) => {
	const controller = new AbortController();
	controller.abort();

	const client = createClient(ctx);

	await expect(async () => {
		await client.getSharedSliceByID("id", { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices/id", client.endpoint),
	run: (client, params) => client.getSharedSliceByID("id", params),
});
