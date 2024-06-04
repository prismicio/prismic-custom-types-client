import * as prismic from "@prismicio/client";

/**
 * The type of a bulk operation.
 */
export const BulkUpdateOperationType = {
	CustomTypeInsert: "CUSTOM_TYPE_INSERT",
	CustomTypeUpdate: "CUSTOM_TYPE_UPDATE",
	CustomTypeDelete: "CUSTOM_TYPE_DELETE",
	SliceInsert: "SLICE_INSERT",
	SliceUpdate: "SLICE_UPDATE",
	SliceDelete: "SLICE_DELETE",
} as const;
export type BulkUpdateOperationType =
	(typeof BulkUpdateOperationType)[keyof typeof BulkUpdateOperationType];

/**
 * An object describing a bulk update operation.
 */
export type BulkUpdateOperation =
	| {
			type: typeof BulkUpdateOperationType.CustomTypeInsert;
			id: string;
			payload: prismic.CustomTypeModel;
	  }
	| {
			type: typeof BulkUpdateOperationType.CustomTypeUpdate;
			id: string;
			payload: prismic.CustomTypeModel;
	  }
	| {
			type: typeof BulkUpdateOperationType.CustomTypeDelete;
			id: string;
			payload: Pick<prismic.CustomTypeModel, "id">;
	  }
	| {
			type: typeof BulkUpdateOperationType.SliceInsert;
			id: string;
			payload: prismic.SharedSliceModel;
	  }
	| {
			type: typeof BulkUpdateOperationType.SliceUpdate;
			id: string;
			payload: prismic.SharedSliceModel;
	  }
	| {
			type: typeof BulkUpdateOperationType.SliceDelete;
			id: string;
			payload: Pick<prismic.SharedSliceModel, "id">;
	  };

export type BulkUpdateTransactionModels = {
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
 * Create a bulk update transaction instance to pass to a Custom Types Client
 * `bulkUpdate()` method.
 */
export const createBulkUpdateTransaction = (
	...args: ConstructorParameters<typeof BulkUpdateTransaction>
): BulkUpdateTransaction => new BulkUpdateTransaction(...args);

export class BulkUpdateTransaction {
	operations: BulkUpdateOperation[];

	constructor(
		initialOperations: BulkUpdateTransaction | BulkUpdateOperation[] = [],
	) {
		this.operations =
			initialOperations instanceof BulkUpdateTransaction
				? initialOperations.operations
				: initialOperations;
	}

	fromDiff(
		before: BulkUpdateTransactionModels,
		after: BulkUpdateTransactionModels,
	): void {
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
			type: BulkUpdateOperationType.CustomTypeInsert,
			id: customType.id,
			payload: customType,
		});
	}

	updateCustomType(customType: prismic.CustomTypeModel): void {
		this.operations.push({
			type: BulkUpdateOperationType.CustomTypeUpdate,
			id: customType.id,
			payload: customType,
		});
	}

	deleteCustomType(customType: prismic.CustomTypeModel): void {
		this.operations.push({
			type: BulkUpdateOperationType.CustomTypeDelete,
			id: customType.id,
			payload: { id: customType.id },
		});
	}

	insertSlice(slice: prismic.SharedSliceModel): void {
		this.operations.push({
			type: BulkUpdateOperationType.SliceInsert,
			id: slice.id,
			payload: slice,
		});
	}

	updateSlice(slice: prismic.SharedSliceModel): void {
		this.operations.push({
			type: BulkUpdateOperationType.SliceUpdate,
			id: slice.id,
			payload: slice,
		});
	}

	deleteSlice(slice: prismic.SharedSliceModel): void {
		this.operations.push({
			type: BulkUpdateOperationType.SliceDelete,
			id: slice.id,
			payload: { id: slice.id },
		});
	}
}
