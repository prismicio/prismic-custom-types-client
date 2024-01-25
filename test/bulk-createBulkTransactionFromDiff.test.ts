import { it, expect, describe } from "vitest";

import { createBulkTransationFromDiff } from "../src";

it("creates a BulkTransaction using the difference between two sets of models", (ctx) => {
	const before = {
		customTypes: [
			ctx.mock.model.customType(),
			ctx.mock.model.customType(),
			ctx.mock.model.customType(),
		],
		slices: [
			ctx.mock.model.sharedSlice(),
			ctx.mock.model.sharedSlice(),
			ctx.mock.model.sharedSlice(),
		],
	};
	const after = {
		customTypes: [
			before.customTypes[0],
			{ ...before.customTypes[1], label: "edited" },
			ctx.mock.model.customType(),
		],
		slices: [
			before.slices[0],
			{ ...before.slices[1], name: "edited" },
			ctx.mock.model.sharedSlice(),
		],
	};

	const res = createBulkTransationFromDiff(before, after);

	expect(res.operations).toStrictEqual([
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
	it("detects creation", (ctx) => {
		const after = ctx.mock.model.customType({ label: "after" });

		const res = createBulkTransationFromDiff(
			{ customTypes: [] },
			{ customTypes: [after] },
		);

		expect(res.operations).toStrictEqual([
			{
				type: "CUSTOM_TYPE_INSERT",
				id: after.id,
				payload: after,
			},
		]);
	});

	it("detects updates", (ctx) => {
		const before = ctx.mock.model.customType({ label: "before" });
		const after = { ...before, label: "after" };

		const res = createBulkTransationFromDiff(
			{ customTypes: [before] },
			{ customTypes: [after] },
		);

		expect(res.operations).toStrictEqual([
			{
				type: "CUSTOM_TYPE_UPDATE",
				id: before.id,
				payload: after,
			},
		]);
	});

	it("detects deletion", (ctx) => {
		const before = ctx.mock.model.customType({ label: "before" });

		const res = createBulkTransationFromDiff(
			{ customTypes: [before] },
			{ customTypes: [] },
		);

		expect(res.operations).toStrictEqual([
			{
				type: "CUSTOM_TYPE_DELETE",
				id: before.id,
				payload: { id: before.id },
			},
		]);
	});
});

describe("slice", () => {
	it("detects creation", (ctx) => {
		const after = ctx.mock.model.sharedSlice({ name: "after" });

		const res = createBulkTransationFromDiff(
			{ slices: [] },
			{ slices: [after] },
		);

		expect(res.operations).toStrictEqual([
			{
				type: "SLICE_INSERT",
				id: after.id,
				payload: after,
			},
		]);
	});

	it("detects updates", (ctx) => {
		const before = ctx.mock.model.sharedSlice({ name: "before" });
		const after = { ...before, name: "after" };

		const res = createBulkTransationFromDiff(
			{ slices: [before] },
			{ slices: [after] },
		);

		expect(res.operations).toStrictEqual([
			{
				type: "SLICE_UPDATE",
				id: before.id,
				payload: after,
			},
		]);
	});

	it("detects deletion", (ctx) => {
		const before = ctx.mock.model.sharedSlice({ name: "before" });

		const res = createBulkTransationFromDiff(
			{ slices: [before] },
			{ slices: [] },
		);

		expect(res.operations).toStrictEqual([
			{
				type: "SLICE_DELETE",
				id: before.id,
				payload: { id: before.id },
			},
		]);
	});
});
