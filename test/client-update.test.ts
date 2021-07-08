import test from "ava";
import * as assert from "assert";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createClient } from "./__testutils__/createClient";
import { createCustomType } from "./__testutils__/createCustomType";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";
import { resolveURL } from "./__testutils__/resolveURL";

import * as prismicCustomTypes from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("updates a Custom Type", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);

	server.use(
		msw.rest.post(resolveURL(client.endpoint, "update"), (req, res, ctx) => {
			if (!isAuthorizedRequest(client, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			assert.deepStrictEqual(req.body, customType);

			return res(ctx.status(204));
		}),
	);

	const res = await client.update(customType);

	t.deepEqual(res, customType);
});

test("uses params if provided", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);
	const params: Required<prismicCustomTypes.CustomTypesAPIParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	server.use(
		msw.rest.post(resolveURL(params.endpoint, "update"), (req, res, ctx) => {
			if (!isAuthorizedRequest(params, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			assert.deepStrictEqual(req.body, customType);

			return res(ctx.status(204));
		}),
	);

	const res = await client.update(customType, params);

	t.deepEqual(res, customType);
});

test("throws NotFoundError if a matching Custom Type was not found", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);

	server.use(
		msw.rest.post(resolveURL(client.endpoint, "update"), (req, res, ctx) => {
			if (!isAuthorizedRequest(client, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			assert.deepStrictEqual(req.body, customType);

			return res(ctx.status(422));
		}),
	);

	await t.throwsAsync(async () => await client.update(customType), {
		instanceOf: prismicCustomTypes.NotFoundError,
	});
});

test("throws InvalidPayloadError if an invalid Custom Type is sent", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);
	const message = "[MOCK INVALID PAYLOAD ERROR]";

	server.use(
		msw.rest.post(resolveURL(client.endpoint, "update"), (req, res, ctx) => {
			if (!isAuthorizedRequest(client, req)) {
				return res(
					ctx.status(403),
					ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
				);
			}

			// We force the API to return a 400 status code to simulate an invalid
			// payload error.
			return res(ctx.status(400), ctx.text(message));
		}),
	);

	await t.throwsAsync(async () => await client.update(customType), {
		instanceOf: prismicCustomTypes.InvalidPayloadError,
		message,
	});
});
