import type { TestContext } from "vitest";
import * as crypto from "crypto";
import fetch from "node-fetch";

import * as prismicCustomTypes from "../../src";

export const createClientConfig = (
	ctx: TestContext,
	overrides?: Partial<prismicCustomTypes.CustomTypesClientConfig>,
): prismicCustomTypes.CustomTypesClientConfig => {
	const repositoryName = crypto
		.createHash("md5")
		.update(ctx.meta.name)
		.digest("hex");
	const token = crypto.createHash("md5").update(repositoryName).digest("hex");
	const endpoint = `https://${repositoryName}.example.com`;

	return {
		repositoryName,
		token,
		endpoint,
		fetch,
		...overrides,
	};
};
