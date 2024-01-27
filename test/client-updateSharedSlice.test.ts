import { expect } from "vitest";

import * as prismic from "@prismicio/client";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import {
	CustomTypesClientMethodParams,
	InvalidPayloadError,
	NotFoundError,
} from "../src";

it("updates a slice", async ({ client, api, slice }) => {
	api.mock("./slices/update", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: slice,
	});
	const res = await client.updateSharedSlice(slice);
	expect(res).toStrictEqual(slice);
});

it("uses params if provided", async ({ client, api, slice }) => {
	const params = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	} satisfies CustomTypesClientMethodParams;

	api.mock(new URL("./slices/update", params.endpoint), undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: slice,
		repositoryName: params.repositoryName,
		token: params.token,
	});
	const res = await client.updateSharedSlice(slice, params);
	expect(res).toStrictEqual(slice);
});

it("throws NotFoundError if a matching slice was not found", async ({
	client,
	api,
	slice,
}) => {
	api.mock("./slices/update", undefined, {
		method: "post",
		statusCode: 422,
		requiredBody: slice,
	});
	await expect(async () => {
		await client.updateSharedSlice(slice);
	}).rejects.toThrow(NotFoundError);
});

it("throws InvalidPayloadError if an invalid slice is sent", async ({
	client,
	api,
	slice,
}) => {
	api.mock("./slices/update", undefined, {
		method: "post",
		statusCode: 400,
		requiredBody: slice,
	});
	await expect(async () => {
		await client.updateSharedSlice(slice);
	}).rejects.toThrow(InvalidPayloadError);
});

it("is abortable", async ({ client, api, slice }) => {
	api.mock("./slices/update", undefined, { method: "post" });

	const controller = new AbortController();
	controller.abort();

	const res = client.updateSharedSlice(slice, {
		signal: controller.signal,
	});
	await expect(res).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./slices/update", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) =>
		client.updateSharedSlice({} as prismic.SharedSliceModel, params),
});
