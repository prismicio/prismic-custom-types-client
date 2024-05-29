import { expect } from "vitest";

import { it } from "./__testutils__/it";
import { testFetchOptions } from "./__testutils__/testFetchOptions";

import * as prismicCustomTypes from "../src";

it("performs a bulk update transaction", async ({ client, mock, api }) => {
	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	const insertedSlice = mock.model.sharedSlice();
	const updatedSlice = mock.model.sharedSlice();
	const deletedSlice = mock.model.sharedSlice();

	const operations = [
		{
			type: prismicCustomTypes.BulkUpdateOperationType.CustomTypeInsert,
			id: insertedCustomType.id,
			payload: insertedCustomType,
		},
		{
			type: prismicCustomTypes.BulkUpdateOperationType.CustomTypeUpdate,
			id: updatedCustomType.id,
			payload: updatedCustomType,
		},
		{
			type: prismicCustomTypes.BulkUpdateOperationType.CustomTypeDelete,
			id: deletedCustomType.id,
			payload: { id: deletedCustomType.id },
		},
		{
			type: prismicCustomTypes.BulkUpdateOperationType.SliceInsert,
			id: insertedSlice.id,
			payload: insertedSlice,
		},
		{
			type: prismicCustomTypes.BulkUpdateOperationType.SliceUpdate,
			id: updatedSlice.id,
			payload: updatedSlice,
		},
		{
			type: prismicCustomTypes.BulkUpdateOperationType.SliceDelete,
			id: deletedSlice.id,
			payload: { id: deletedSlice.id },
		},
	];

	api.mock("./bulk-update", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: {
			changes: operations,
		},
	});

	const res = await client.bulkUpdate(operations);

	expect(res).toStrictEqual(operations);
});

it("supports BulkUpdateTransaction instance", async ({ client, mock, api }) => {
	const bulkUpdateTransaction =
		prismicCustomTypes.createBulkUpdateTransaction();

	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	bulkUpdateTransaction.insertCustomType(insertedCustomType);
	bulkUpdateTransaction.updateCustomType(updatedCustomType);
	bulkUpdateTransaction.deleteCustomType(deletedCustomType);

	const insertedSlice = mock.model.sharedSlice();
	const updatedSlice = mock.model.sharedSlice();
	const deletedSlice = mock.model.sharedSlice();

	bulkUpdateTransaction.insertSlice(insertedSlice);
	bulkUpdateTransaction.updateSlice(updatedSlice);
	bulkUpdateTransaction.deleteSlice(deletedSlice);

	api.mock("./bulk-update", undefined, {
		method: "post",
		statusCode: 204,
		requiredBody: {
			changes: bulkUpdateTransaction.operations,
		},
	});

	const res = await client.bulkUpdate(bulkUpdateTransaction);

	expect(res).toStrictEqual(bulkUpdateTransaction.operations);
});

it("is abortable", async ({ client, api }) => {
	api.mock("./bulk-update", undefined, { method: "post" });

	const controller = new AbortController();
	controller.abort();

	await expect(async () => {
		await client.bulkUpdate([], { signal: controller.signal });
	}).rejects.toThrow(/aborted/i);
});

testFetchOptions("supports fetch options", {
	mockURL: (client) => new URL("./bulk-update", client.endpoint),
	mockURLMethod: "post",
	run: (client, params) => client.bulkUpdate([], params),
});
