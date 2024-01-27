import * as prismic from "@prismicio/client";

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
	(typeof BulkOperationType)[keyof typeof BulkOperationType];

/**
 * An object describing a bulk operation.
 */
export type BulkOperation =
	| {
			type: typeof BulkOperationType.CustomTypeInsert;
			id: string;
			payload: prismic.CustomTypeModel;
	  }
	| {
			type: typeof BulkOperationType.CustomTypeUpdate;
			id: string;
			payload: prismic.CustomTypeModel;
	  }
	| {
			type: typeof BulkOperationType.CustomTypeDelete;
			id: string;
			payload: Pick<prismic.CustomTypeModel, "id">;
	  }
	| {
			type: typeof BulkOperationType.SliceInsert;
			id: string;
			payload: prismic.SharedSliceModel;
	  }
	| {
			type: typeof BulkOperationType.SliceUpdate;
			id: string;
			payload: prismic.SharedSliceModel;
	  }
	| {
			type: typeof BulkOperationType.SliceDelete;
			id: string;
			payload: Pick<prismic.SharedSliceModel, "id">;
	  };

export type BulkTransactionModels = {
	customTypes?: prismic.CustomTypeModel[];
	slices?: prismic.SharedSliceModel[];
};

const processDiff = <
	TModel extends prismic.CustomTypeModel | prismic.SharedSliceModel,
>(
	before: TModel[],
	after: TModel[],
	callbacks: {
		onInsert: (model: TModel) => void;
		onUpdate: (model: TModel) => void;
		onDelete: (model: TModel) => void;
	},
): void => {
	for (const afterModel of after) {
		const beforeModel = before.find((model) => model.id === afterModel.id);

		if (beforeModel) {
			if (JSON.stringify(beforeModel) !== JSON.stringify(afterModel)) {
				callbacks.onUpdate(afterModel);
			}

			before = before.filter((model) => model !== beforeModel);
		} else {
			callbacks.onInsert(afterModel);
		}
	}

	for (const beforeModel of before) {
		callbacks.onDelete(beforeModel);
	}
};

/**
 * Create a bulk transaction instance to pass to a Custom Types Client `bulk()`
 * method.
 */
export const createBulkTransaction = (
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

	fromDiff(before: BulkTransactionModels, after: BulkTransactionModels): void {
		processDiff(before.customTypes ?? [], after.customTypes ?? [], {
			onInsert: (model) => this.insertCustomType(model),
			onUpdate: (model) => this.updateCustomType(model),
			onDelete: (model) => this.deleteCustomType(model),
		});
		processDiff(before.slices ?? [], after.slices ?? [], {
			onInsert: (model) => this.insertSlice(model),
			onUpdate: (model) => this.updateSlice(model),
			onDelete: (model) => this.deleteSlice(model),
		});
	}

	insertCustomType(customType: prismic.CustomTypeModel): void {
		this.operations.push({
			type: BulkOperationType.CustomTypeInsert,
			id: customType.id,
			payload: customType,
		});
	}

	updateCustomType(customType: prismic.CustomTypeModel): void {
		this.operations.push({
			type: BulkOperationType.CustomTypeUpdate,
			id: customType.id,
			payload: customType,
		});
	}

	deleteCustomType(customType: prismic.CustomTypeModel): void {
		this.operations.push({
			type: BulkOperationType.CustomTypeDelete,
			id: customType.id,
			payload: { id: customType.id },
		});
	}

	insertSlice(slice: prismic.SharedSliceModel): void {
		this.operations.push({
			type: BulkOperationType.SliceInsert,
			id: slice.id,
			payload: slice,
		});
	}

	updateSlice(slice: prismic.SharedSliceModel): void {
		this.operations.push({
			type: BulkOperationType.SliceUpdate,
			id: slice.id,
			payload: slice,
		});
	}

	deleteSlice(slice: prismic.SharedSliceModel): void {
		this.operations.push({
			type: BulkOperationType.SliceDelete,
			id: slice.id,
			payload: { id: slice.id },
		});
	}
}
