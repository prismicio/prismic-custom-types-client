import * as prismicT from "@prismicio/types";

export const createCustomType = <
	CustomTypeModel extends prismicT.CustomTypeModel,
>(
	overrides?: Partial<CustomTypeModel>,
): prismicT.CustomTypeModel<CustomTypeModel["id"], CustomTypeModel["json"]> => {
	const id = Math.random().toString();
	const label = Math.random().toString();

	return {
		id,
		status: true,
		json: {},
		label,
		repeatable: true,
		...overrides,
	};
};
