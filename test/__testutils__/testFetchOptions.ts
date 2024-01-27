import { expect, vi } from "vitest";

import { RequestInitLike } from "@prismicio/client/*";
import { http } from "msw";

import { it } from "./it";

import * as lib from "../../src";

type TestFetchOptionsArgs = {
	mockURL: (client: lib.CustomTypesClient) => URL;
	mockURLMethod?: keyof typeof http;
	run: (
		client: lib.CustomTypesClient,
		params?: Parameters<lib.CustomTypesClient["getAllCustomTypes"]>[0],
	) => Promise<unknown>;
};

export const testFetchOptions = (
	description: string,
	args: TestFetchOptionsArgs,
): void => {
	it(`${description} (on client)`, async ({ client, api }) => {
		const abortController = new AbortController();

		client.fetchFn = vi.fn(fetch);
		client.fetchOptions = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		};

		api.mock(args.mockURL(client), {}, { method: args.mockURLMethod });

		await args.run(client);

		for (const [input, init] of vi.mocked(client.fetchFn).mock.calls) {
			expect(init, input.toString()).toStrictEqual(
				expect.objectContaining({
					...client.fetchOptions,
					headers: expect.objectContaining(client.fetchOptions.headers),
				}),
			);
		}
	});

	it.concurrent(`${description} (on method)`, async ({ client, api, mock }) => {
		const abortController = new AbortController();

		client.fetchFn = vi.fn(fetch);

		api.mock(args.mockURL(client), [mock.model.customType()], {
			method: args.mockURLMethod,
		});

		const fetchOptions: RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		};

		await args.run(client, { fetchOptions });

		for (const [input, init] of vi.mocked(client.fetchFn).mock.calls) {
			expect(init, input.toString()).toStrictEqual(
				expect.objectContaining({
					...fetchOptions,
					headers: expect.objectContaining(fetchOptions.headers),
				}),
			);
		}
	});
};
