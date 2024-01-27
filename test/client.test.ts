import { expect, vi } from "vitest";

import { it } from "./__testutils__/it";

import {
	CustomTypesClient,
	ForbiddenError,
	MissingFetchError,
	PrismicError,
	UnauthorizedError,
	createClient,
} from "../src";

it("createCustomTypesClient creates a CustomTypesClient", () => {
	const client = createClient({
		repositoryName: "repositoryName",
		token: "token",
	});
	expect(client).toBeInstanceOf(CustomTypesClient);
});

it("has correct default state", () => {
	const fetch = vi.fn();
	const client = createClient({
		repositoryName: "repositoryName",
		endpoint: "endpoint",
		token: "token",
		fetch,
		fetchOptions: {
			headers: {
				foo: "bar",
			},
		},
	});

	expect(client.repositoryName).toBe("repositoryName");
	expect(client.endpoint).toBe("endpoint");
	expect(client.token).toBe("token");
	expect(client.fetchFn).toBe(fetch);
	expect(client.fetchOptions).toStrictEqual({
		headers: {
			foo: "bar",
		},
	});
});

it("uses the default endpoint if none is provided", () => {
	const client = createClient({
		repositoryName: "repositoryName",
		token: "token",
	});
	expect(client.endpoint).toBe("https://customtypes.prismic.io");
});

it("supports custom endpoints that include /customtypes (for backwards compatiblity)", () => {
	const client = createClient({
		repositoryName: "repositoryName",
		token: "token",
		endpoint: "https://example.com/customtypes",
	});
	expect(client.endpoint).toBe("https://example.com");
});

it("supports custom endpoints that include /customtypes/ (for backwards compatiblity)", () => {
	const client = createClient({
		repositoryName: "repositoryName",
		token: "token",
		endpoint: "https://example.com/customtypes/",
	});
	expect(client.endpoint).toBe("https://example.com");
});

it("constructor throws MissingFetchError if fetch is unavailable", () => {
	const originalFetch = globalThis.fetch;
	// @ts-expect-error - Forcing fetch to be undefined
	delete globalThis.fetch;

	expect(() => {
		createClient({
			repositoryName: "repositoryName",
			token: "token",
		});
	}).toThrow(MissingFetchError);

	globalThis.fetch = originalFetch;
});

// We wouldn't normally test for input types since TypeScript handles that for
// us at build time, but we want to provide a nicer DX for non-TypeScript users.
it("constructor throws MissingFetchError if provided fetch is not a function", () => {
	const originalFetch = globalThis.fetch;
	// @ts-expect-error - Forcing fetch to be undefined
	delete globalThis.fetch;

	expect(() => {
		createClient({
			repositoryName: "repositoryName",
			token: "token",
			// @ts-expect-error - We are purposly providing an invalid type to test if it throws.
			fetch: "not a function",
		});
	}).toThrow(MissingFetchError);

	globalThis.fetch = originalFetch;
});

it("uses globalThis.fetch if available", async () => {
	const existingFetch = globalThis.fetch;
	const responseBody = { foo: "bar" };
	globalThis.fetch = async () => Response.json(responseBody);

	const client = createClient({
		repositoryName: "repositoryName",
		token: "token",
	});
	const fetchResponse = await client.fetchFn("");
	const jsonResponse = await fetchResponse.json();

	expect(jsonResponse).toStrictEqual(responseBody);

	globalThis.fetch = existingFetch;
});

it("doesn't duplicate endpoint trailing slash", async () => {
	const fetchSpy = vi.fn();
	const client = createClient({
		repositoryName: "repositoryName",
		token: "token",
		fetch: fetchSpy,
	});

	client.endpoint = "https://example.com";
	try {
		await client.getCustomTypeByID("foo");
	} catch {
		// Noop, we don't mock fetch fully / carry the request
	}
	expect(fetchSpy).toHaveBeenLastCalledWith(
		"https://example.com/customtypes/foo",
		expect.any(Object),
	);

	client.endpoint = "https://example.com/";
	try {
		await client.getCustomTypeByID("foo");
	} catch {
		// Noop, we don't mock fetch fully / carry the request
	}
	expect(fetchSpy).toHaveBeenLastCalledWith(
		"https://example.com/customtypes/foo",
		expect.any(Object),
	);

	client.endpoint = "https://example.com/api";
	try {
		await client.getCustomTypeByID("foo");
	} catch {
		// Noop, we don't mock fetch fully / carry the request
	}
	expect(fetchSpy).toHaveBeenLastCalledWith(
		"https://example.com/api/customtypes/foo",
		expect.any(Object),
	);

	client.endpoint = "https://example.com/api/";
	try {
		await client.getCustomTypeByID("foo");
	} catch {
		// Noop, we don't mock fetch fully / carry the request
	}
	expect(fetchSpy).toHaveBeenLastCalledWith(
		"https://example.com/api/customtypes/foo",
		expect.any(Object),
	);
});

it("throws UnauthorizedError if unauthorized", async ({ client, api }) => {
	api.mock("./customtypes", undefined, { statusCode: 401 });
	await expect(async () => {
		await client.getAllCustomTypes();
	}).rejects.toThrow(UnauthorizedError);
});

it("throws ForbiddenError if forbidden", async ({ client, api }) => {
	api.mock("./customtypes", {}, { statusCode: 403 });
	await expect(async () => {
		await client.getAllCustomTypes();
	}).rejects.toThrow(ForbiddenError);
});

it("throws PrismicError if an unsupported response is returned", async ({
	client,
	api,
}) => {
	api.mock("./customtypes", undefined, { statusCode: 418 });
	await expect(async () => {
		await client.getAllCustomTypes();
	}).rejects.toThrow(PrismicError);
});
