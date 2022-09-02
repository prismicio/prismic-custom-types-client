import * as prismicCustomTypes from "@prismicio/custom-types-client";
import fetch from "node-fetch";

/**
 * The Prismic Repository name.
 */
const PRISMIC_REPOSITORY_NAME = "qwerty";

/**
 * The Prismic Custom Types API secret token for the repository.
 */
const PRISMIC_CUSTOM_TYPES_API_TOKEN = "secret-token";

const main = async () => {
	const customTypesClient = prismicCustomTypes.createClient({
		repositoryName: PRISMIC_REPOSITORY_NAME,
		token: PRISMIC_CUSTOM_TYPES_API_TOKEN,
		fetch,
	});

	// Get all Custom Type models from the repository.
	const models = await customTypesClient.getAllCustomTypes();
	console.info({ models });

	// Get the "page" Custom Type model from the repository.
	const pageModel = await customTypesClient.getCustomTypeByID("page");
	console.info({ pageModel });

	// Update the "page" Custom Type model from the repository.
	// This example disables the model from new documents being created.
	await customTypesClient.updateCustomType({
		...pageModel,
		status: false,
	});

	// Remove the "page" Custom Type model from the repository.
	await customTypesClient.removeCustomType("page");

	// Re-add the "page" Custom Type model.
	await customTypesClient.insertCustomType(pageModel);
};

main();
