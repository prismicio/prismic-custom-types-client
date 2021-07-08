import * as ava from "ava";

import { createClientConfig } from "./createClientConfig";

import * as prismic from "../../src";

export const createClient = (
	t: ava.ExecutionContext,
	configOverrides?: Partial<prismic.CustomTypesClientConfig>,
): prismic.CustomTypesClient => {
	const config = createClientConfig(t, configOverrides);

	return prismic.createClient(config);
};
