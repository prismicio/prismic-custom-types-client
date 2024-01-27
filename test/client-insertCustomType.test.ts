import { expect } from "vitest";

import * as prismic from "@prismicio/client";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import {
	ConflictError,
	CustomTypesClientMethodParams,
	InvalidPayloadError,
} from "../src";

it("inserts a custom type", async ({ client, api, customType }) => {
	api.mock(`./customtypes/insert`, undefined, {
		method: "post",
		statusCode: 201,
		requiredBody: customType,
	});
	const res = await client.insertCustomType(customType);
	expect(res).toStrictEqual(customType);
});

it("uses params if provided", async ({ client, api, customType }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL("./customtypes/insert", params.endpoint), undefined, {
		method: "post",
		statusCode: 201,
		requiredBody: customType,
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.insertCustomType(customType, params);
	expect(res).toStrictEqual(customType);
});

it("throws ConflictError if a custom type with the same ID already exists", async ({
	client,
	api,
	customType,
}) => {
	api.mock(`./customtypes/insert`, undefined, {
		method: "post",
		statusCode: 409,
		requiredBody: customType,
	});
	await expect(async () => {
		await client.insertCustomType(customType);
	}).rejects.toThrow(ConflictError);
});

it("throws InvalidPayloadError if an invalid Custom Type is sent", async ({
	client,
	api,
	customType,
}) => {
	api.mock(`./customtypes/insert`, undefined, {
		method: "post",
		statusCode: 400,
		requiredBody: customType,
	});
	await expect(async () => {
		await client.insertCustomType(customType);
	}).rejects.toThrow(InvalidPayloadError);
});

it("is abortable", async ({ client, api, customType }) => {
	api.mock(`./customtypes/insert`, undefined, { method: "post" });

	const controller = new AbortController();
	controller.abort();

	const res = client.insertCustomType(customType, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./customtypes/insert", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) =>
		client.insertCustomType({} as prismic.CustomTypeModel, params),
});
