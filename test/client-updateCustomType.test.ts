import { expect } from "vitest";

import * as prismic from "@prismicio/client";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import {
	CustomTypesClientMethodParams,
	InvalidPayloadError,
	NotFoundError,
} from "../src";

it("updates a custom type", async ({ client, api, customType }) => {
	api.mock("./customtypes/update", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: customType,
	});
	const res = await client.updateCustomType(customType);
	expect(res).toStrictEqual(customType);
});

it("uses params if provided", async ({ client, api, customType }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL("./customtypes/update", params.endpoint), undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: customType,
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.updateCustomType(customType, params);
	expect(res).toStrictEqual(customType);
});

it("throws NotFoundError if a matching custom type was not found", async ({
	client,
	api,
	customType,
}) => {
	api.mock("./customtypes/update", undefined, {
		method: "post",
		statusCode: 422,
		requiredBody: customType,
	});
	await expect(async () => {
		await client.updateCustomType(customType);
	}).rejects.toThrow(NotFoundError);
});

it("throws InvalidPayloadError if an invalid custom type is sent", async ({
	client,
	api,
	customType,
}) => {
	api.mock("./customtypes/update", undefined, {
		method: "post",
		statusCode: 400,
		requiredBody: customType,
	});
	await expect(async () => {
		await client.updateCustomType(customType);
	}).rejects.toThrow(InvalidPayloadError);
});

it("is abortable", async ({ client, api, customType }) => {
	api.mock("./customtypes/update", undefined, { method: "post" });

	const controller = new AbortController();
	controller.abort();

	const res = client.updateCustomType(customType, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./customtypes/update", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) =>
		client.updateCustomType({} as prismic.CustomTypeModel, params),
});
