import { it, expect, describe } from "vitest";

import * as prismicCustomTypes from "../src";

it("supports multiple operations", (ctx) => {
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

	const res = prismicCustomTypes.BulkTransaction.fromDiff(before, after);

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

		const res = prismicCustomTypes.BulkTransaction.fromDiff(
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

		const res = prismicCustomTypes.BulkTransaction.fromDiff(
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

		const res = prismicCustomTypes.BulkTransaction.fromDiff(
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

		const res = prismicCustomTypes.BulkTransaction.fromDiff(
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

		const res = prismicCustomTypes.BulkTransaction.fromDiff(
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

		const res = prismicCustomTypes.BulkTransaction.fromDiff(
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
