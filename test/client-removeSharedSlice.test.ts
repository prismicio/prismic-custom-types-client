import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import { CustomTypesClientMethodParams } from "../src";

it("removes a slice", async ({ client, api, slice }) => {
	api.mock(`./slices/${slice.id}`, undefined, {
		method: "delete",
		statusCode: 204,
	});
	const res = await client.removeSharedSlice(slice.id);
	expect(res).toStrictEqual(slice.id);
});

it("uses params if provided", async ({ client, api, slice }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL(`./slices/${slice.id}`, params.endpoint), undefined, {
		method: "delete",
		statusCode: 204,
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.removeSharedSlice(slice.id, params);
	expect(res).toStrictEqual(slice.id);
});

it("is abortable", async ({ client, api, slice }) => {
	api.mock(`./slices/${slice.id}`, undefined, { method: "delete" });

	const controller = new AbortController();
	controller.abort();

	const res = client.removeSharedSlice(slice.id, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices/id", client.endpoint),
	mockURLMethod: "delete",
	run: (client, params) => client.removeSharedSlice("id", params),
});

// NOTE: The API does not return a 4xx status code if a non-existing slice
// is deleted. Instead, it returns 204 just like a successful deletion request.
// As a result, we have nothing to test.
//
// Leave this comment to document the reasoning why no test exists for this case.
// test.todo("throws NotFoundError if a matching slice was not found");
