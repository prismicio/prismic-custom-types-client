import * as ava from "ava";
import * as crypto from "crypto";
import fetch from "node-fetch";

import * as prismicCustomTypes from "../../src";

export const createClientConfig = (
	t: ava.ExecutionContext,
	overrides?: Partial<prismicCustomTypes.CustomTypesClientConfig>,
): prismicCustomTypes.CustomTypesClientConfig => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const token = crypto.createHash("md5").update(repositoryName).digest("hex");
	const endpoint = `https://${repositoryName}.example.com/customtypes`;

	return {
		repositoryName,
		token,
		endpoint,
		fetch,
		...overrides,
	};
};
