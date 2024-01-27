import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import { CustomTypesClientMethodParams, NotFoundError } from "../src";

it("returns a slice by ID", async ({ client, api, slice }) => {
	api.mock(`./slices/${slice.id}`, slice);
	const res = await client.getSharedSliceByID(slice.id);
	expect(res).toStrictEqual(slice);
});

it("uses params if provided", async ({ client, api, slice }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL(`./slices/${slice.id}`, params.endpoint), slice, {
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.getSharedSliceByID(slice.id, params);
	expect(res).toStrictEqual(slice);
});

it("throws NotFoundError if a matching slice was not found", async ({
	client,
	api,
	slice,
}) => {
	api.mock(`./slices/${slice.id}`, undefined, { statusCode: 404 });
	await expect(async () => {
		await client.getSharedSliceByID(slice.id);
	}).rejects.toThrow(NotFoundError);
});

it("is abortable", async ({ client, api, slice }) => {
	api.mock(`./slices/${slice.id}`);

	const controller = new AbortController();
	controller.abort();

	const res = client.getSharedSliceByID(slice.id, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices/id", client.endpoint),
	run: (client, params) => client.getSharedSliceByID("id", params),
});
