import { expect } from "vitest";

import { it } from "./__testutils__/it";

import { createBulkTransaction } from "../src";

it("starts with an empty array of operations", () => {
	const bulkTransaction = createBulkTransaction();

	expect(bulkTransaction.operations).toStrictEqual([]);
});

it("supports custom type operations", ({ mock }) => {
	const bulkTransaction = createBulkTransaction();

	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	bulkTransaction.insertCustomType(insertedCustomType);
	bulkTransaction.updateCustomType(updatedCustomType);
	bulkTransaction.deleteCustomType(deletedCustomType);

	expect(bulkTransaction.operations).toStrictEqual([
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
	const bulkTransaction = createBulkTransaction();

	const insertedSlice = mock.model.sharedSlice();
	const updatedSlice = mock.model.sharedSlice();
	const deletedSlice = mock.model.sharedSlice();

	bulkTransaction.insertSlice(insertedSlice);
	bulkTransaction.updateSlice(updatedSlice);
	bulkTransaction.deleteSlice(deletedSlice);

	expect(bulkTransaction.operations).toStrictEqual([
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

	const bulkTransaction1 = createBulkTransaction();
	bulkTransaction1.insertCustomType(insertedCustomType);

	const bulkTransaction2 = createBulkTransaction(bulkTransaction1.operations);
	bulkTransaction2.updateCustomType(updatedCustomType);
	bulkTransaction2.deleteCustomType(deletedCustomType);

	expect(bulkTransaction2.operations).toStrictEqual([
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

it("supports initial BulkTransaction", ({ mock }) => {
	const insertedCustomType = mock.model.customType();
	const updatedCustomType = mock.model.customType();
	const deletedCustomType = mock.model.customType();

	const bulkTransaction1 = createBulkTransaction();
	bulkTransaction1.insertCustomType(insertedCustomType);

	const bulkTransaction2 = createBulkTransaction(bulkTransaction1);
	bulkTransaction2.updateCustomType(updatedCustomType);
	bulkTransaction2.deleteCustomType(deletedCustomType);

	expect(bulkTransaction2.operations).toStrictEqual([
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
