import * as prismicT from "@prismicio/types";

export const createSharedSlice = <
	SharedSliceModel extends prismicT.SharedSliceModel,
>(
	overrides?: Partial<SharedSliceModel>,
): SharedSliceModel => {
	const type = Math.random().toString();
	const id = Math.random().toString();
	const name = Math.random().toString();

	return {
		type,
		id,
		name,
		description: "description",
		variations: [],
		...overrides,
	} as SharedSliceModel;
};
