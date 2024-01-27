import { describe, expect } from "vitest";

import { it } from "./__testutils__/it";

import { createBulkTransaction } from "../src";

it("adds operations using the difference between two sets of models", ({
	mock,
}) => {
	const before = {
		customTypes: [
			mock.model.customType(),
			mock.model.customType(),
			mock.model.customType(),
		],
		slices: [
			mock.model.sharedSlice(),
			mock.model.sharedSlice(),
			mock.model.sharedSlice(),
		],
	};
	const after = {
		customTypes: [
			before.customTypes[0],
			{ ...before.customTypes[1], label: "edited" },
			mock.model.customType(),
		],
		slices: [
			before.slices[0],
			{ ...before.slices[1], name: "edited" },
			mock.model.sharedSlice(),
		],
	};

	const bulkTransaction = createBulkTransaction();
	bulkTransaction.fromDiff(before, after);

	expect(bulkTransaction.operations).toStrictEqual([
		{
			type: "CUSTOM_TYPE_UPDATE",
			id: after.customTypes[1].id,
			payload: after.customTypes[1],
		},
		{
			type: "CUSTOM_TYPE_INSERT",
			id: after.customTypes[2].id,
			payload: after.customTypes[2],
		},
		{
			type: "CUSTOM_TYPE_DELETE",
			id: before.customTypes[2].id,
			payload: { id: before.customTypes[2].id },
		},
		{
			type: "SLICE_UPDATE",
			id: after.slices[1].id,
			payload: after.slices[1],
		},
		{
			type: "SLICE_INSERT",
			id: after.slices[2].id,
			payload: after.slices[2],
		},
		{
			type: "SLICE_DELETE",
			id: before.slices[2].id,
			payload: { id: before.slices[2].id },
		},
	]);
});

describe("custom type", () => {
	it("detects creation", ({ mock }) => {
		const after = mock.model.customType({ label: "after" });

		const bulkTransaction = createBulkTransaction();
		bulkTransaction.fromDiff({ customTypes: [] }, { customTypes: [after] });

		expect(bulkTransaction.operations).toStrictEqual([
			{
				type: "CUSTOM_TYPE_INSERT",
				id: after.id,
				payload: after,
			},
		]);
	});

	it("detects updates", ({ mock }) => {
		const before = mock.model.customType({ label: "before" });
		const after = { ...before, label: "after" };

		const bulkTransaction = createBulkTransaction();
		bulkTransaction.fromDiff(
			{ customTypes: [before] },
			{ customTypes: [after] },
		);

		expect(bulkTransaction.operations).toStrictEqual([
			{
				type: "CUSTOM_TYPE_UPDATE",
				id: before.id,
				payload: after,
			},
		]);
	});

	it("detects deletion", ({ mock }) => {
		const before = mock.model.customType({ label: "before" });

		const bulkTransaction = createBulkTransaction();
		bulkTransaction.fromDiff({ customTypes: [before] }, { customTypes: [] });

		expect(bulkTransaction.operations).toStrictEqual([
			{
				type: "CUSTOM_TYPE_DELETE",
				id: before.id,
				payload: { id: before.id },
			},
		]);
	});
});

describe("slice", () => {
	it("detects creation", ({ mock }) => {
		const after = mock.model.sharedSlice({ name: "after" });

		const bulkTransaction = createBulkTransaction();
		bulkTransaction.fromDiff({ slices: [] }, { slices: [after] });

		expect(bulkTransaction.operations).toStrictEqual([
			{
				type: "SLICE_INSERT",
				id: after.id,
				payload: after,
			},
		]);
	});

	it("detects updates", ({ mock }) => {
		const before = mock.model.sharedSlice({ name: "before" });
		const after = { ...before, name: "after" };

		const bulkTransaction = createBulkTransaction();
		bulkTransaction.fromDiff({ slices: [before] }, { slices: [after] });

		expect(bulkTransaction.operations).toStrictEqual([
			{
				type: "SLICE_UPDATE",
				id: before.id,
				payload: after,
			},
		]);
	});

	it("detects deletion", ({ mock }) => {
		const before = mock.model.sharedSlice({ name: "before" });

		const bulkTransaction = createBulkTransaction();
		bulkTransaction.fromDiff({ slices: [before] }, { slices: [] });

		expect(bulkTransaction.operations).toStrictEqual([
			{
				type: "SLICE_DELETE",
				id: before.id,
				payload: { id: before.id },
			},
		]);
	});
});
