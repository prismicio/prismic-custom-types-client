import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import { CustomTypesClientMethodParams } from "../src";

it("returns all custom types", async ({ client, api, customType }) => {
	api.mock("./customtypes", [customType]);
	const res = await client.getAllCustomTypes();
	expect(res).toStrictEqual([customType]);
});

it("uses params if provided", async ({ client, api, customType }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL("./customtypes", params.endpoint), [customType], {
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.getAllCustomTypes(params);
	expect(res).toStrictEqual([customType]);
});

it("is abortable", async ({ client, api }) => {
	api.mock("./customtypes");

	const controller = new AbortController();
	controller.abort();

	const res = client.getAllCustomTypes({ signal: controller.signal });
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./customtypes", client.endpoint),
	run: (client, params) => client.getAllCustomTypes(params),
});
