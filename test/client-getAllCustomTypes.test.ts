import { expect, test } from "vitest";

import * as msw from "msw";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import * as prismicCustomTypes from "../src";

test("returns all Custom Types", async (ctx) => {
	const queryResponse = [ctx.mock.model.customType()];
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(
			new URL("./customtypes", client.endpoint).toString(),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.json(queryResponse));
			},
		),
	);

	const res = await client.getAllCustomTypes();

	expect(res).toStrictEqual(queryResponse);
});

test("uses params if provided", async (ctx) => {
	const queryResponse = [ctx.mock.model.customType()];
	const client = createClient(ctx);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	ctx.server.use(
		msw.rest.get(
			new URL("./customtypes", params.endpoint).toString(),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.json(queryResponse));
			},
		),
	);

	const res = await client.getAllCustomTypes(params);

	expect(res).toStrictEqual(queryResponse);
});

test("is abortable", async (ctx) => {
	const controller = new AbortController();
	controller.abort();

	const client = createClient(ctx);

	await expect(async () => {
		await client.getAllCustomTypes({ signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./customtypes", client.endpoint),
	run: (client, params) => client.getAllCustomTypes(params),
});
