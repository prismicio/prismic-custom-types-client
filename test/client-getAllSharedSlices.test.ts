import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import { CustomTypesClientMethodParams } from "../src";

it("returns all slices", async ({ client, api, slice }) => {
	api.mock("./slices", [slice]);
	const res = await client.getAllSharedSlices();
	expect(res).toStrictEqual([slice]);
});

it("uses params if provided", async ({ client, api, slice }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL("./slices", params.endpoint), [slice], {
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.getAllSharedSlices(params);
	expect(res).toStrictEqual([slice]);
});

it("is abortable", async ({ client, api }) => {
	api.mock("./slices");

	const controller = new AbortController();
	controller.abort();

	const res = client.getAllSharedSlices({ signal: controller.signal });
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices", client.endpoint),
	run: (client, params) => client.getAllSharedSlices(params),
});
