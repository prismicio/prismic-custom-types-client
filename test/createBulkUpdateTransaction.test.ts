import { expect } from "vitest";

import { it } from "./__testutils__/it";

import { createBulkUpdateTransaction } from "../src";

it("starts with an empty array of operations", () => {
	const bulkUpdateTransaction = createBulkUpdateTransaction();

	expect(bulkUpdateTransaction.operations).toStrictEqual([]);
});

it("supports custom type operations", ({ mock }) => {
	const bulkUpdateTransaction = createBulkUpdateTransaction();

	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	bulkUpdateTransaction.insertCustomType(insertedCustomType);
	bulkUpdateTransaction.updateCustomType(updatedCustomType);
	bulkUpdateTransaction.deleteCustomType(deletedCustomType);

	expect(bulkUpdateTransaction.operations).toStrictEqual([
		{
			type: "CUSTOM_TYPE_INSERT",
			id: insertedCustomType.id,
			payload: insertedCustomType,
		},
		{
			type: "CUSTOM_TYPE_UPDATE",
			id: updatedCustomType.id,
			payload: updatedCustomType,
		},
		{
			type: "CUSTOM_TYPE_DELETE",
			id: deletedCustomType.id,
			payload: { id: deletedCustomType.id },
		},
	]);
});

it("supports slice operations", ({ mock }) => {
	const bulkUpdateTransaction = createBulkUpdateTransaction();

	const insertedSlice = mock.model.sharedSlice();
	const updatedSlice = mock.model.sharedSlice();
	const deletedSlice = mock.model.sharedSlice();

	bulkUpdateTransaction.insertSlice(insertedSlice);
	bulkUpdateTransaction.updateSlice(updatedSlice);
	bulkUpdateTransaction.deleteSlice(deletedSlice);

	expect(bulkUpdateTransaction.operations).toStrictEqual([
		{
			type: "SLICE_INSERT",
			id: insertedSlice.id,
			payload: insertedSlice,
		},
		{
			type: "SLICE_UPDATE",
			id: updatedSlice.id,
			payload: updatedSlice,
		},
		{
			type: "SLICE_DELETE",
			id: deletedSlice.id,
			payload: { id: deletedSlice.id },
		},
	]);
});

it("supports initial operations", ({ mock }) => {
	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	const bulkUpdateTransaction1 = createBulkUpdateTransaction();
	bulkUpdateTransaction1.insertCustomType(insertedCustomType);

	const bulkUpdateTransaction2 = createBulkUpdateTransaction(
		bulkUpdateTransaction1.operations,
	);
	bulkUpdateTransaction2.updateCustomType(updatedCustomType);
	bulkUpdateTransaction2.deleteCustomType(deletedCustomType);

	expect(bulkUpdateTransaction2.operations).toStrictEqual([
		{
			type: "CUSTOM_TYPE_INSERT",
			id: insertedCustomType.id,
			payload: insertedCustomType,
		},
		{
			type: "CUSTOM_TYPE_UPDATE",
			id: updatedCustomType.id,
			payload: updatedCustomType,
		},
		{
			type: "CUSTOM_TYPE_DELETE",
			id: deletedCustomType.id,
			payload: { id: deletedCustomType.id },
		},
	]);
});

it("supports initial BulkUpdateTransaction", ({ mock }) => {
	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	const bulkUpdateTransaction1 = createBulkUpdateTransaction();
	bulkUpdateTransaction1.insertCustomType(insertedCustomType);

	const bulkUpdateTransaction2 = createBulkUpdateTransaction(
		bulkUpdateTransaction1,
	);
	bulkUpdateTransaction2.updateCustomType(updatedCustomType);
	bulkUpdateTransaction2.deleteCustomType(deletedCustomType);

	expect(bulkUpdateTransaction2.operations).toStrictEqual([
		{
			type: "CUSTOM_TYPE_INSERT",
			id: insertedCustomType.id,
			payload: insertedCustomType,
		},
		{
			type: "CUSTOM_TYPE_UPDATE",
			id: updatedCustomType.id,
			payload: updatedCustomType,
		},
		{
			type: "CUSTOM_TYPE_DELETE",
			id: deletedCustomType.id,
			payload: { id: deletedCustomType.id },
		},
	]);
});
