import * as prismicT from "@prismicio/types";

/**
 * The type of a bulk operation.
 */
export const BulkOperationType = {
	CustomTypeInsert: "CUSTOM_TYPE_INSERT",
	CustomTypeUpdate: "CUSTOM_TYPE_UPDATE",
	CustomTypeDelete: "CUSTOM_TYPE_DELETE",
	SliceInsert: "SLICE_INSERT",
	SliceUpdate: "SLICE_UPDATE",
	SliceDelete: "SLICE_DELETE",
} as const;
export type BulkOperationType =
	typeof BulkOperationType[keyof typeof BulkOperationType];

/**
 * An object describing a bulk operation.
 */
export type BulkOperation =
	| {
			type: typeof BulkOperationType.CustomTypeInsert;
			id: string;
			payload: prismicT.CustomTypeModel;
	  }
	| {
			type: typeof BulkOperationType.CustomTypeUpdate;
			id: string;
			payload: prismicT.CustomTypeModel;
	  }
	| {
			type: typeof BulkOperationType.CustomTypeDelete;
			id: string;
			payload: Pick<prismicT.CustomTypeModel, "id">;
	  }
	| {
			type: typeof BulkOperationType.SliceInsert;
			id: string;
			payload: prismicT.SharedSliceModel;
	  }
	| {
			type: typeof BulkOperationType.SliceUpdate;
			id: string;
			payload: prismicT.SharedSliceModel;
	  }
	| {
			type: typeof BulkOperationType.SliceDelete;
			id: string;
			payload: Pick<prismicT.SharedSliceModel, "id">;
	  };

/**
 * Create a bulk transaction instance to pass to a Custom Types Client `bulk()`
 * method.
 */
export const createBulkTransation = (
	...args: ConstructorParameters<typeof BulkTransaction>
): BulkTransaction => new BulkTransaction(...args);

export class BulkTransaction {
	operations: BulkOperation[];

	constructor(initialOperations: BulkTransaction | BulkOperation[] = []) {
		this.operations =
			initialOperations instanceof BulkTransaction
				? initialOperations.operations
				: initialOperations;
	}

	insertCustomType(customType: prismicT.CustomTypeModel): void {
		this.operations.push({
			type: BulkOperationType.CustomTypeInsert,
			id: customType.id,
			payload: customType,
		});
	}

	updateCustomType(customType: prismicT.CustomTypeModel): void {
		this.operations.push({
			type: BulkOperationType.CustomTypeUpdate,
			id: customType.id,
			payload: customType,
		});
	}

	deleteCustomType(customType: prismicT.CustomTypeModel): void {
		this.operations.push({
			type: BulkOperationType.CustomTypeDelete,
			id: customType.id,
			payload: { id: customType.id },
		});
	}

	insertSlice(slice: prismicT.SharedSliceModel): void {
		this.operations.push({
			type: BulkOperationType.SliceInsert,
			id: slice.id,
			payload: slice,
		});
	}

	updateSlice(slice: prismicT.SharedSliceModel): void {
		this.operations.push({
			type: BulkOperationType.SliceUpdate,
			id: slice.id,
			payload: slice,
		});
	}

	deleteSlice(slice: prismicT.SharedSliceModel): void {
		this.operations.push({
			type: BulkOperationType.SliceDelete,
			id: slice.id,
			payload: { id: slice.id },
		});
	}
}
