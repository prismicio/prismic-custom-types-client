import { test, expect } from "vitest";

import * as prismicCustomTypes from "../src";

test("createCustomTypesClient creates a CustomTypesClient", () => {
	const bulkTransaction = prismicCustomTypes.createBulkTransation();

	expect(bulkTransaction).toBeInstanceOf(prismicCustomTypes.BulkTransaction);
});

test("supports custom type operations", (ctx) => {
	const bulkTransaction = prismicCustomTypes.createBulkTransation();

	const insertedCustomType = ctx.mock.model.customType();
	const updatedCustomType = ctx.mock.model.customType();
	const deletedCustomType = ctx.mock.model.customType();

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

test("supports slice operations", (ctx) => {
	const bulkTransaction = prismicCustomTypes.createBulkTransation();

	const insertedSlice = ctx.mock.model.sharedSlice();
	const updatedSlice = ctx.mock.model.sharedSlice();
	const deletedSlice = ctx.mock.model.sharedSlice();

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

test("supports initial operations", (ctx) => {
	const insertedCustomType = ctx.mock.model.customType();
	const updatedCustomType = ctx.mock.model.customType();
	const deletedCustomType = ctx.mock.model.customType();

	const bulkTransaction1 = prismicCustomTypes.createBulkTransation();
	bulkTransaction1.insertCustomType(insertedCustomType);

	const bulkTransaction2 = prismicCustomTypes.createBulkTransation(
		bulkTransaction1.operations,
	);
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

test("supports initial BulkTransaction", (ctx) => {
	const insertedCustomType = ctx.mock.model.customType();
	const updatedCustomType = ctx.mock.model.customType();
	const deletedCustomType = ctx.mock.model.customType();

	const bulkTransaction1 = prismicCustomTypes.createBulkTransation();
	bulkTransaction1.insertCustomType(insertedCustomType);

	const bulkTransaction2 =
		prismicCustomTypes.createBulkTransation(bulkTransaction1);
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
