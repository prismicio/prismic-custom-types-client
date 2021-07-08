import * as prismicT from "@prismicio/types";

import * as prismic from "../../src";

export const createCustomType = <
	CustomTypeModel extends prismicT.CustomTypeModel,
>(
	overrides?: Partial<prismic.CustomType<CustomTypeModel>>,
): prismic.CustomType<CustomTypeModel> => {
	const id = Math.random().toString();
	const label = Math.random().toString();

	return {
		id,
		status: true,
		json: {} as CustomTypeModel,
		label,
		repeatable: true,
		...overrides,
	};
};
