import { test, expect } from "vitest";
import * as msw from "msw";
import { Response } from "node-fetch";

import { createClientConfig } from "./__testutils__/createClientConfig";
import { createClient } from "./__testutils__/createClient";

import * as prismicCustomTypes from "../src";

test("createCustomTypesClient creates a CustomTypesClient", (ctx) => {
	const config = createClientConfig(ctx);
	const client = prismicCustomTypes.createClient(config);

	expect(client).toBeInstanceOf(prismicCustomTypes.CustomTypesClient);
});

test("has correct default state", (ctx) => {
	const config = createClientConfig(ctx);
	const client = prismicCustomTypes.createClient(config);

	expect(client.repositoryName).toBe(config.repositoryName);
	expect(client.endpoint).toBe(config.endpoint);
	expect(client.token).toBe(config.token);
	expect(client.fetchFn).toBe(config.fetch);
});

test("uses the default endpoint if none is provided", (ctx) => {
	const config = createClientConfig(ctx);
	delete config.endpoint;

	const client = prismicCustomTypes.createClient(config);

	expect(client.endpoint).toBe("https://customtypes.prismic.io/customtypes");
});

test("constructor throws MissingFetchError if fetch is unavailable", (ctx) => {
	const config = createClientConfig(ctx);
	delete config.fetch;

	const originalFetch = globalThis.fetch;
	// @ts-expect-error - Forcing fetch to be undefined
	delete globalThis.fetch;

	expect(() => {
		prismicCustomTypes.createClient(config);
	}).toThrow(prismicCustomTypes.MissingFetchError);

	globalThis.fetch = originalFetch;
});

// We wouldn't normally test for input types since TypeScript handles that for
// us at build time, but we want to provide a nicer DX for non-TypeScript users.
test("constructor throws MissingFetchError if provided fetch is not a function", (ctx) => {
	const config = createClientConfig(ctx);
	// @ts-expect-error - We are purposly providing an invalid type to test if it throws.
	config.fetch = "not a function";

	const originalFetch = globalThis.fetch;
	// @ts-expect-error - Forcing fetch to be undefined
	delete globalThis.fetch;

	expect(() => {
		prismicCustomTypes.createClient(config);
	}).toThrow(prismicCustomTypes.MissingFetchError);

	globalThis.fetch = originalFetch;
});

test("uses globalThis.fetch if available", async (ctx) => {
	const existingFetch = globalThis.fetch;
	const responseBody = { foo: "bar" };
	globalThis.fetch = async () =>
		// @ts-expect-error - node-fetch does not implement the full Response interface
		new Response(JSON.stringify(responseBody));

	const config = createClientConfig(ctx);
	delete config.fetch;

	const client = prismicCustomTypes.createClient(config);
	const fetchResponse = await client.fetchFn("");
	const jsonResponse = await fetchResponse.json();

	expect(jsonResponse).toStrictEqual(responseBody);

	globalThis.fetch = existingFetch;
});

test("throws ForbiddenError if unauthorized", async (ctx) => {
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(client.endpoint, (_req, res, ctx) => {
			// We force the API to return a 403 status code to simulate an
			// unauthorized request.
			return res(
				ctx.status(403),
				ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
			);
		}),
	);

	await expect(async () => {
		await client.getAllCustomTypes();
	}).rejects.toThrow(prismicCustomTypes.ForbiddenError);
});

test("throws PrismicError if an unsupported response is returned", async (ctx) => {
	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.get(client.endpoint, (_req, res, ctx) => {
			// We force the API to return a 418 status code (I'm a teapot) to simulate
			// an unsupported response.
			return res(ctx.status(418));
		}),
	);

	await expect(async () => {
		await client.getAllCustomTypes();
	}).rejects.toThrow(prismicCustomTypes.PrismicError);
});
