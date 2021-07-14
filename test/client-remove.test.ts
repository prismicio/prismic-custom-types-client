import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createClient } from "./__testutils__/createClient";
import { createCustomType } from "./__testutils__/createCustomType";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";

import * as prismicCustomTypes from "../src";
import { resolveURL } from "./__testutils__/resolveURL";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("removes a Custom Type", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);

	server.use(
		msw.rest.delete(
			resolveURL(client.endpoint, customType.id),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.remove(customType.id);

	t.deepEqual(res, customType.id);
});

test("uses params if provided", async (t) => {
	const customType = createCustomType();
	const client = createClient(t);
	const params: Required<prismicCustomTypes.CustomTypesClientMethodParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.example.com",
	};

	server.use(
		msw.rest.delete(
			resolveURL(params.endpoint, customType.id),
			(req, res, ctx) => {
				if (!isAuthorizedRequest(params, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				return res(ctx.status(204));
			},
		),
	);

	const res = await client.remove(customType.id, params);

	t.deepEqual(res, customType.id);
});

// NOTE: The API does not return a 4xx status code if a non-existing Custom Type
// is deleted. Instead, it returns 204 just like a successful deletion request.
// As a result, we have nothing to test.
//
// Leave this comment to document the reasoning why no test exists for this case.
// test.todo("throws NotFoundError if a matching Custom Type was not found");
