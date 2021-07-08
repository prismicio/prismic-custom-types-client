import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";
import { Response } from "node-fetch";

import { createClientConfig } from "./__testutils__/createClientConfig";
import { createClient } from "./__testutils__/createClient";

import * as prismicCustomTypes from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("createCustomTypesClient creates a CustomTypesClient", (t) => {
	const config = createClientConfig(t);
	const client = prismicCustomTypes.createClient(config);

	t.true(client instanceof prismicCustomTypes.CustomTypesClient);
});

test("has correct default state", (t) => {
	const config = createClientConfig(t);
	const client = prismicCustomTypes.createClient(config);

	t.is(client.repositoryName, config.repositoryName);
	t.is(client.endpoint, config.endpoint);
	t.is(client.token, config.token);
	t.is(client.fetchFn, config.fetch);
});

test("uses the default endpoint if none is provided", (t) => {
	const config = createClientConfig(t);
	delete config.endpoint;

	const client = prismicCustomTypes.createClient(config);

	t.is(client.endpoint, "https://customtypes.prismic.io/customtypes");
});

test("constructor throws MissingFetchError if fetch is unavailable", (t) => {
	const config = createClientConfig(t);
	delete config.fetch;

	t.throws(() => prismicCustomTypes.createClient(config), {
		instanceOf: prismicCustomTypes.MissingFetchError,
	});
});

// We wouldn't normally test for input types since TypeScript handles that for
// us at build time, but we want to provide a nicer DX for non-TypeScript users.
test("constructor throws MissingFetchError if provided fetch is not a function", (t) => {
	const config = createClientConfig(t);
	// @ts-expect-error - We are purposly providing an invalid type to test if it throws.
	config.fetch = "not a function";

	t.throws(() => prismicCustomTypes.createClient(config), {
		instanceOf: prismicCustomTypes.MissingFetchError,
	});
});

test("uses globalThis.fetch if available", async (t) => {
	const existingFetch = globalThis.fetch;
	const responseBody = { foo: "bar" };
	globalThis.fetch = async () =>
		// @ts-expect-error - node-fetch does not implement the full Response interface
		new Response(JSON.stringify(responseBody));

	const config = createClientConfig(t);
	delete config.fetch;

	const client = prismicCustomTypes.createClient(config);
	const fetchResponse = await client.fetchFn("");
	const jsonResponse = await fetchResponse.json();

	t.deepEqual(jsonResponse, responseBody);

	globalThis.fetch = existingFetch;
});

test("throws ForbiddenError if unauthorized", async (t) => {
	const client = createClient(t);

	server.use(
		msw.rest.get(client.endpoint, (_req, res, ctx) => {
			// We force the API to return a 403 status code to simulate an
			// unauthorized request.
			return res(
				ctx.status(403),
				ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
			);
		}),
	);

	await t.throwsAsync(async () => await client.getAll(), {
		instanceOf: prismicCustomTypes.ForbiddenError,
	});
});

test("throws PrismicError if an unsupported response is returned", async (t) => {
	const client = createClient(t);

	server.use(
		msw.rest.get(client.endpoint, (_req, res, ctx) => {
			// We force the API to return a 418 status code (I'm a teapot) to simulate
			// an unsupported response.
			return res(ctx.status(418));
		}),
	);

	await t.throwsAsync(async () => await client.getAll(), {
		instanceOf: prismicCustomTypes.PrismicError,
	});
});
