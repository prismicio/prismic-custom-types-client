import { expect } from "vitest";

import * as prismic from "@prismicio/client";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import {
	ConflictError,
	CustomTypesClientMethodParams,
	InvalidPayloadError,
} from "../src";

it("inserts a slice", async ({ client, api, slice }) => {
	api.mock(`./slices/insert`, undefined, {
		method: "post",
		statusCode: 201,
		requiredBody: slice,
	});
	const res = await client.insertSharedSlice(slice);
	expect(res).toStrictEqual(slice);
});

it("uses params if provided", async ({ client, api, slice }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL("./slices/insert", params.endpoint), undefined, {
		method: "post",
		statusCode: 201,
		requiredBody: slice,
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.insertSharedSlice(slice, params);
	expect(res).toStrictEqual(slice);
});

it("throws ConflictError if a slice with the same ID already exists", async ({
	client,
	api,
	slice,
}) => {
	api.mock(`./slices/insert`, undefined, {
		method: "post",
		statusCode: 409,
		requiredBody: slice,
	});
	await expect(async () => {
		await client.insertSharedSlice(slice);
	}).rejects.toThrow(ConflictError);
});

it("throws InvalidPayloadError if an invalid Custom Type is sent", async ({
	client,
	api,
	slice,
}) => {
	api.mock(`./slices/insert`, undefined, {
		method: "post",
		statusCode: 400,
		requiredBody: slice,
	});
	await expect(async () => {
		await client.insertSharedSlice(slice);
	}).rejects.toThrow(InvalidPayloadError);
});

it("is abortable", async ({ client, api, slice }) => {
	api.mock(`./slices/insert`, undefined, { method: "post" });

	const controller = new AbortController();
	controller.abort();

	const res = client.insertSharedSlice(slice, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices/insert", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) =>
		client.insertSharedSlice({} as prismic.SharedSliceModel, params),
});
