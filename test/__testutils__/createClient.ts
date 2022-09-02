import type { TestContext } from "vitest";

import { createClientConfig } from "./createClientConfig";

import * as prismic from "../../src";

export const createClient = (
	ctx: TestContext,
	configOverrides?: Partial<prismic.CustomTypesClientConfig>,
): prismic.CustomTypesClient => {
	const config = createClientConfig(ctx, configOverrides);

	return prismic.createClient(config);
};
