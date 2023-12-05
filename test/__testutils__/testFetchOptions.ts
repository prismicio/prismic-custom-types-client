import { expect, it, vi } from "vitest";
import * as msw from "msw";

import fetch from "node-fetch";

import { createClient } from "./createClient";
import { isAuthorizedRequest } from "./isAuthorizedRequest";

import * as lib from "../../src";

type TestFetchOptionsArgs = {
	mockURL: (client: lib.CustomTypesClient) => URL;
	mockURLMethod?: keyof typeof msw.rest;
	run: (
		client: lib.CustomTypesClient,
		params?: Parameters<lib.CustomTypesClient["getAllCustomTypes"]>[0],
	) => Promise<unknown>;
};

export const testFetchOptions = (
	description: string,
	args: TestFetchOptionsArgs,
): void => {
	it.concurrent(`${description} (on client)`, async (ctx) => {
		const abortController = new AbortController();

		const fetchSpy = vi.fn(fetch);
		const fetchOptions: lib.RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		};

		const client = createClient(ctx, {
			fetch: fetchSpy,
			fetchOptions,
		});

		ctx.server.use(
			msw.rest[args.mockURLMethod || "get"](
				args.mockURL(client).toString(),
				(req, res, ctx) => {
					if (!isAuthorizedRequest(client, req)) {
						return res(
							ctx.status(403),
							ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
						);
					}

					return res(ctx.json({}));
				},
			),
		);

		await args.run(client);

		for (const [input, init] of fetchSpy.mock.calls) {
			expect(init, input.toString()).toStrictEqual(
				expect.objectContaining({
					...fetchOptions,
					headers: expect.objectContaining(fetchOptions.headers),
				}),
			);
		}
	});

	it.concurrent(`${description} (on method)`, async (ctx) => {
		const abortController = new AbortController();

		const fetchSpy = vi.fn(fetch);
		const fetchOptions: lib.RequestInitLike = {
			cache: "no-store",
			headers: {
				foo: "bar",
			},
			signal: abortController.signal,
		};

		const client = createClient(ctx, {
			fetch: fetchSpy,
		});

		const queryResponse = [ctx.mock.model.customType()];
		ctx.server.use(
			msw.rest[args.mockURLMethod || "get"](
				args.mockURL(client).toString(),
				(req, res, ctx) => {
					if (!isAuthorizedRequest(client, req)) {
						return res(
							ctx.status(403),
							ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
						);
					}

					return res(ctx.json(queryResponse));
				},
			),
		);

		await args.run(client, { fetchOptions });

		for (const [input, init] of fetchSpy.mock.calls) {
			expect(init, input.toString()).toStrictEqual(
				expect.objectContaining({
					...fetchOptions,
					headers: expect.objectContaining(fetchOptions.headers),
				}),
			);
		}
	});
};
