import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import * as prismicCustomTypes from "../src";

it("performs a bulk transaction", async ({ client, mock, api }) => {
	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	const insertedSlice = mock.model.sharedSlice();
	const updatedSlice = mock.model.sharedSlice();
	const deletedSlice = mock.model.sharedSlice();

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

	api.mock("./bulk", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: {
			confirmDeleteDocuments: false,
			changes: operations,
		},
	});

	const res = await client.bulk(operations);

	expect(res).toStrictEqual(operations);
});

it("supports BulkTransation instance", async ({ client, mock, api }) => {
	const bulkTransaction = prismicCustomTypes.createBulkTransaction();

	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	bulkTransaction.insertCustomType(insertedCustomType);
	bulkTransaction.updateCustomType(updatedCustomType);
	bulkTransaction.deleteCustomType(deletedCustomType);

	const insertedSlice = mock.model.sharedSlice();
	const updatedSlice = mock.model.sharedSlice();
	const deletedSlice = mock.model.sharedSlice();

	bulkTransaction.insertSlice(insertedSlice);
	bulkTransaction.updateSlice(updatedSlice);
	bulkTransaction.deleteSlice(deletedSlice);

	api.mock("./bulk", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: {
			confirmDeleteDocuments: false,
			changes: bulkTransaction.operations,
		},
	});

	const res = await client.bulk(bulkTransaction);

	expect(res).toStrictEqual(bulkTransaction.operations);
});

it("does not delete documents by default", async ({ client, api }) => {
	api.mock("./bulk", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: {
			confirmDeleteDocuments: false,
			changes: [],
		},
	});

	await expect(client.bulk([])).resolves.not.toThrow();
});

it("allows confirming document deletion", async ({ client, api }) => {
	api.mock("./bulk", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: {
			confirmDeleteDocuments: true,
			changes: [],
		},
	});

	await expect(
		client.bulk([], { deleteDocuments: true }),
	).resolves.not.toThrow();
});

it("throws BulkTransactionConfirmationError if confirmation is needed", async ({
	client,
	api,
}) => {
	api.mock(
		"./bulk",
		{ details: { customTypes: [] } },
		{ method: "post", statusCode: 202 },
	);

	await expect(async () => {
		await client.bulk([]);
	}).rejects.toThrow(prismicCustomTypes.BulkTransactionConfirmationError);
});

it("throws BulkTransactionLimitError if the command limit is reached", async ({
	client,
	api,
}) => {
	api.mock(
		"./bulk",
		{ details: { customTypes: [] } },
		{ method: "post", statusCode: 403 },
	);

	await expect(async () => {
		await client.bulk([]);
	}).rejects.toThrow(prismicCustomTypes.BulkTransactionLimitError);
});

it("is abortable", async ({ client, api }) => {
	api.mock("./bulk", undefined, { method: "post" });

	const controller = new AbortController();
	controller.abort();

	await expect(async () => {
		await client.bulk([], { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./bulk", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) => client.bulk([], params),
});
