import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import { CustomTypesClientMethodParams, NotFoundError } from "../src";

it("returns a custom type by ID", async ({ client, api, customType }) => {
	api.mock(`./customtypes/${customType.id}`, customType);
	const res = await client.getCustomTypeByID(customType.id);
	expect(res).toStrictEqual(customType);
});

it("uses params if provided", async ({ client, api, customType }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(
		new URL(`./customtypes/${customType.id}`, params.endpoint),
		customType,
		{
			repositoryName: params.repositoryName,
			token: params.token,
		},
	);
	const res = await client.getCustomTypeByID(customType.id, params);
	expect(res).toStrictEqual(customType);
});

it("throws NotFoundError if a matching custom type was not found", async ({
	client,
	api,
	customType,
}) => {
	api.mock(`./customtypes/${customType.id}`, undefined, { statusCode: 404 });
	await expect(async () => {
		await client.getCustomTypeByID(customType.id);
	}).rejects.toThrow(NotFoundError);
});

it("is abortable", async ({ client, api, customType }) => {
	api.mock(`./customtypes/${customType.id}`);

	const controller = new AbortController();
	controller.abort();

	const res = client.getCustomTypeByID(customType.id, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./customtypes/id", client.endpoint),
	run: (client, params) => client.getCustomTypeByID("id", params),
});
