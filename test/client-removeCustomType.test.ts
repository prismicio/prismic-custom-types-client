import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import { CustomTypesClientMethodParams } from "../src";

it("removes a custom type", async ({ client, api, customType }) => {
	api.mock(`./customtypes/${customType.id}`, undefined, {
		method: "delete",
		statusCode: 204,
	});
	const res = await client.removeCustomType(customType.id);
	expect(res).toStrictEqual(customType.id);
});

it("uses params if provided", async ({ client, api, customType }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(
		new URL(`./customtypes/${customType.id}`, params.endpoint),
		undefined,
		{
			method: "delete",
			statusCode: 204,
			repositoryName: params.repositoryName,
			token: params.token,
		},
	);
	const res = await client.removeCustomType(customType.id, params);
	expect(res).toStrictEqual(customType.id);
});

it("is abortable", async ({ client, api, customType }) => {
	api.mock(`./customtypes/${customType.id}`, undefined, { method: "delete" });

	const controller = new AbortController();
	controller.abort();

	const res = client.removeCustomType(customType.id, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./customtypes/id", client.endpoint),
	mockURLMethod: "delete",
	run: (client, params) => client.removeCustomType("id", params),
});

// NOTE: The API does not return a 4xx status code if a non-existing custom type
// is deleted. Instead, it returns 204 just like a successful deletion request.
// As a result, we have nothing to test.
//
// Leave this comment to document the reasoning why no test exists for this case.
// test.todo("throws NotFoundError if a matching custom type was not found");
