import { test, expect } from "vitest";
import * as msw from "msw";
import * as assert from "assert";

import { createClient } from "./__testutils__/createClient";
import { isAuthorizedRequest } from "./__testutils__/isAuthorizedRequest";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import * as prismicCustomTypes from "../src";

test("performs a bulk transaction", async (ctx) => {
	const insertedCustomType = ctx.mock.model.customType();
	const updatedCustomType = ctx.mock.model.customType();
	const deletedCustomType = ctx.mock.model.customType();

	const insertedSlice = ctx.mock.model.sharedSlice();
	const updatedSlice = ctx.mock.model.sharedSlice();
	const deletedSlice = ctx.mock.model.sharedSlice();

	const operations = [
		{
			type: prismicCustomTypes.BulkOperationType.CustomTypeInsert,
			id: insertedCustomType.id,
			payload: insertedCustomType,
		},
		{
			type: prismicCustomTypes.BulkOperationType.CustomTypeUpdate,
			id: updatedCustomType.id,
			payload: updatedCustomType,
		},
		{
			type: prismicCustomTypes.BulkOperationType.CustomTypeDelete,
			id: deletedCustomType.id,
			payload: { id: deletedCustomType.id },
		},
		{
			type: prismicCustomTypes.BulkOperationType.SliceInsert,
			id: insertedSlice.id,
			payload: insertedSlice,
		},
		{
			type: prismicCustomTypes.BulkOperationType.SliceUpdate,
			id: updatedSlice.id,
			payload: updatedSlice,
		},
		{
			type: prismicCustomTypes.BulkOperationType.SliceDelete,
			id: deletedSlice.id,
			payload: { id: deletedSlice.id },
		},
	];

	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			new URL("./bulk", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), operations);

				return res(ctx.status(201));
			},
		),
	);

	const res = await client.bulk(operations);

	expect(res).toStrictEqual(operations);
});

test("supports BulkTransation instance", async (ctx) => {
	const bulkTransaction = prismicCustomTypes.createBulkTransation();

	const insertedCustomType = ctx.mock.model.customType();
	const updatedCustomType = ctx.mock.model.customType();
	const deletedCustomType = ctx.mock.model.customType();

	bulkTransaction.insertCustomType(insertedCustomType);
	bulkTransaction.updateCustomType(updatedCustomType);
	bulkTransaction.deleteCustomType(deletedCustomType);

	const insertedSlice = ctx.mock.model.sharedSlice();
	const updatedSlice = ctx.mock.model.sharedSlice();
	const deletedSlice = ctx.mock.model.sharedSlice();

	bulkTransaction.insertSlice(insertedSlice);
	bulkTransaction.updateSlice(updatedSlice);
	bulkTransaction.deleteSlice(deletedSlice);

	const client = createClient(ctx);

	ctx.server.use(
		msw.rest.post(
			new URL("./bulk", client.endpoint).toString(),
			async (req, res, ctx) => {
				if (!isAuthorizedRequest(client, req)) {
					return res(
						ctx.status(403),
						ctx.json({ message: "[MOCK FORBIDDEN ERROR]" }),
					);
				}

				assert.deepStrictEqual(await req.json(), bulkTransaction.operations);

				return res(ctx.status(201));
			},
		),
	);

	const res = await client.bulk(bulkTransaction);

	expect(res).toStrictEqual(bulkTransaction.operations);
});

// TODO: This test fails for unknown reasons. The POST fetch request seems to
// throw outside the `async/await` instruction.
test.skip("is abortable", async (ctx) => {
	const bulkTransaction = prismicCustomTypes.createBulkTransation();
	bulkTransaction.insertCustomType(ctx.mock.model.customType());

	const client = createClient(ctx);

	const controller = new AbortController();
	controller.abort();

	await expect(async () => {
		await client.bulk(bulkTransaction, { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./bulk", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) => client.bulk([], params),
});
