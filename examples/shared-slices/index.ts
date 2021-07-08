import * as prismicCustomTypes from "@prismicio/custom-types-client";
import fetch from "node-fetch";

/** The Prismic Repository name. */
const PRISMIC_REPOSITORY_NAME = "qwerty";

/** The Prismic Custom Types API secret token for the repository. */
const PRISMIC_CUSTOM_TYPES_API_TOKEN = "secret-token";

const main = async () => {
	const customTypesClient = prismicCustomTypes.createClient({
		repositoryName: PRISMIC_REPOSITORY_NAME,
		token: PRISMIC_CUSTOM_TYPES_API_TOKEN,
		fetch,
	});

	// Get all Shared Slice models from the repository.
	const models = await customTypesClient.getAllSharedSlices();
	console.info({ models });

	// Get the "hero" Shared Slice model from the repository.
	const heroModel = await customTypesClient.getSharedSliceByID("hero");
	console.info({ heroModel });

	// Update the "hero" Shared Slice model from the repository.
	// This example disables the model from new documents being created.
	await customTypesClient.updateSharedSlice({
		...heroModel,
		description: "Updated description",
	});

	// Remove the "hero" Shared Slice model from the repository.
	await customTypesClient.removeSharedSlice("hero");

	// Re-add the "hero" Shared Slice model.
	await customTypesClient.insertSharedSlice(heroModel);
};

main();
