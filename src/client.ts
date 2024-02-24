import type * as prismic from "@prismicio/client";

import type {
	AbortSignalLike,
	FetchLike,
	RequestInitLike,
	ScreenshotACLResponse,
} from "./types";

import {
	BulkTransactionConfirmationError,
	BulkTransactionLimitError,
	ConflictError,
	ForbiddenError,
	InvalidPayloadError,
	MissingFetchError,
	NotFoundError,
	PrismicError,
	UnauthorizedError,
} from "./errors";

import { BulkOperation, BulkTransaction } from "./bulk";

/**
 * The default endpoint for the Prismic Custom Types API.
 */
const DEFAULT_CUSTOM_TYPES_API_ENDPOINT = "https://customtypes.prismic.io";

/**
 * The default ACL endpoint for the Prismic S3 screenshots bucket.
 */
const DEFAULT_SCREENSHOT_ACL_ENDPOINT =
	"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/";

/**
 * The lifetime of a screnshot ACL in milliseconds.
 */
const SCREENSHOT_ACL_TTL = 300_000;

/**
 * Configuration for creating a `CustomTypesClient`.
 */
export type CustomTypesClientConfig = {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard
	 * Custom Types API endpoint will be used if no value is provided.
	 */
	endpoint?: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is
	 * required to call any Custom Type API methods.
	 */
	token: string;

	/**
	 * The function used to make network requests to the Prismic Custom Types API.
	 * In environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetch?: FetchLike;

	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike;

	/**
	 * The ACL endpoint for the Prismic S3 screenshots bucket. The standard
	 * endpoint will be used if no value is provided.
	 */
	screenshotACLEndpoint: string;
};

/**
 * Parameters for `CustomTypesClient` methods. Values provided here will
 * override the client's default values, if present.
 */
export type CustomTypesClientMethodParams = Partial<
	Pick<CustomTypesClientConfig, "repositoryName" | "endpoint" | "token">
>;

/**
 * Parameters for client methods that use `fetch()`.
 */
type FetchParams = {
	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike;

	/**
	 * An `AbortSignal` provided by an `AbortController`. This allows the network
	 * request to be cancelled if necessary.
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal}
	 */
	signal?: AbortSignalLike;
};

/**
 * Parameters for the `bulk()` client method.
 */
type BulkParams = {
	/**
	 * Determines if the method stops a bulk request if the changes require
	 * deleting Prismic documents.
	 *
	 * @defaultValue false
	 */
	deleteDocuments?: boolean;
};

type ScreenshotACL = {
	uploadEndpoint: string;
	imgixEndpoint: string;
	formDataFields: Record<string, string>;
};

/**
 * Create a `RequestInit` object for a POST `fetch` request. The provided body
 * will be run through `JSON.stringify`.
 *
 * @param body - The request's body.
 *
 * @returns The `RequestInit` object with the given body.
 */
const createPostFetchRequestInit = <T>(body: T): RequestInitLike => {
	return {
		method: "POST",
		body: JSON.stringify(body),
	};
};

const updateSliceVariationImageInPlace = async <
	TSharedSliceModelVariation extends prismic.SharedSliceModelVariation,
>(
	variation: TSharedSliceModelVariation,
	url: URL,
): Promise<TSharedSliceModelVariation> => {
	return { ...variation, imageUrl: url.toString() };
};

/**
 * Create a client for the Prismic Custom Types API.
 */
export const createClient = (
	...args: ConstructorParameters<typeof CustomTypesClient>
): CustomTypesClient => new CustomTypesClient(...args);

/**
 * A client for the Prismic Custom Types API.
 *
 * @see Custom Types API documentation: {@link https://prismic.io/docs/technologies/custom-types-api}
 */
export class CustomTypesClient {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard
	 * Custom Types API endpoint will be used if no value is provided.
	 *
	 * @defaultValue `https://customtypes.prismic.io`
	 */
	endpoint: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is
	 * required to call any Custom Type API methods.
	 */
	token: string;

	/**
	 * The function used to make network requests to the Prismic Custom Types API.
	 * In environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetchFn: FetchLike;

	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike;

	/**
	 * The ACL endpoint for the Prismic S3 screenshots bucket. The standard
	 * endpoint will be used if no value is provided.
	 */
	screenshotACLEndpoint: string;

	private screenshotACL?: ScreenshotACL;
	private screenshotACLExpiresAt?: number;

	/**
	 * Create a client for the Prismic Custom Types API.
	 */
	constructor(config: CustomTypesClientConfig) {
		this.repositoryName = config.repositoryName;
		this.endpoint = config.endpoint || DEFAULT_CUSTOM_TYPES_API_ENDPOINT;
		this.token = config.token;
		this.fetchOptions = config.fetchOptions;
		this.screenshotACLEndpoint =
			config.screenshotACLEndpoint || DEFAULT_SCREENSHOT_ACL_ENDPOINT;

		// TODO: Remove the following `if` statement in v2.
		//
		// v1 erroneously assumed `/customtypes` would be part of
		// `this.endpoint`, forcing all custom endpoints to include
		// `/customtypes`.
		//
		// The client no longer assumes `/customtypes`. This `if`
		// statement ensures backwards compatibility with existing
		// custom endpoints that includes `/customtypes`.
		if (/\/customtypes\/?$/.test(this.endpoint)) {
			this.endpoint = this.endpoint.replace(/\/customtypes\/?$/, "");
		}

		if (typeof config.fetch === "function") {
			this.fetchFn = config.fetch;
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch;
		} else {
			throw new MissingFetchError(
				"A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` config parameter.",
			);
		}

		// If the global fetch function is used, we must bind it to the global scope.
		if (this.fetchFn === globalThis.fetch) {
			this.fetchFn = this.fetchFn.bind(globalThis);
		}
	}

	/**
	 * Returns all Custom Types models from the Prismic repository.
	 *
	 * @typeParam TCustomType - The Custom Type returned from the API.
	 *
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns All Custom Type models from the Prismic repository.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 */
	async getAllCustomTypes<TCustomType extends prismic.CustomTypeModel>(
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TCustomType[]> {
		return await this.fetch<TCustomType[]>("./customtypes", params);
	}

	/**
	 * Returns a Custom Type model with a given ID from the Prismic repository.
	 *
	 * @typeParam TCustomType - The Custom Type returned from the API.
	 *
	 * @param id - ID of the Custom Type.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The Custom Type model from the Prismic repository.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link NotFoundError} Thrown if a Custom Type with the given ID
	 *   cannot be found.
	 */
	async getCustomTypeByID<TCustomType extends prismic.CustomTypeModel>(
		id: string,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TCustomType> {
		return await this.fetch<TCustomType>(`./customtypes/${id}`, params);
	}

	/**
	 * Inserts a Custom Type model to the Prismic repository.
	 *
	 * @typeParam TCustomType - The Custom Type to insert.
	 *
	 * @param customType - The Custom Type to insert.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The inserted Custom Type.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Custom Type is
	 *   provided.
	 * @throws {@link ConflictError} Thrown if a Custom Type with the given ID
	 *   already exists.
	 */
	async insertCustomType<TCustomType extends prismic.CustomTypeModel>(
		customType: TCustomType,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TCustomType> {
		await this.fetch<undefined>(
			"./customtypes/insert",
			params,
			createPostFetchRequestInit(customType),
		);

		return customType;
	}

	/**
	 * Updates a Custom Type model from the Prismic repository.
	 *
	 * @typeParam TCustomType - The updated Custom Type.
	 *
	 * @param customType - The updated Custom Type.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The updated Custom Type.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Custom Type is
	 *   provided.
	 * @throws {@link NotFoundError} Thrown if a Custom Type with the given ID
	 *   cannot be found.
	 */
	async updateCustomType<TCustomType extends prismic.CustomTypeModel>(
		customType: TCustomType,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TCustomType> {
		await this.fetch<undefined>(
			"./customtypes/update",
			params,
			createPostFetchRequestInit(customType),
		);

		return customType;
	}

	/**
	 * Removes a Custom Type model from the Prismic repository.
	 *
	 * @typeParam TCustomTypeID - The ID of the Custom Type.
	 *
	 * @param id - The ID of the Custom Type to remove.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The ID of the removed Custom Type.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 */
	async removeCustomType<TCustomTypeID extends string>(
		id: TCustomTypeID,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TCustomTypeID> {
		await this.fetch<undefined>(`./customtypes/${id}`, params, {
			method: "DELETE",
		});

		return id;
	}

	/**
	 * Returns all Shared Slice models from the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The Shared Slice model returned from the
	 *   API.
	 *
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns All Shared Slice models from the Prismic repository.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 */
	async getAllSharedSlices<TSharedSliceModel extends prismic.SharedSliceModel>(
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TSharedSliceModel[]> {
		return await this.fetch<TSharedSliceModel[]>("./slices", params);
	}

	/**
	 * Returns a Shared Slice model with a given ID from the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The Shared Slice model returned from the
	 *   API.
	 *
	 * @param id - ID of the Shared Slice.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The Shared Slice model from the Prismic repository.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link NotFoundError} Thrown if a Shared Slice with the given ID
	 *   cannot be found.
	 */
	async getSharedSliceByID<TSharedSliceModel extends prismic.SharedSliceModel>(
		id: string,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TSharedSliceModel> {
		return await this.fetch<TSharedSliceModel>(`./slices/${id}`, params);
	}

	/**
	 * Inserts a Shared Slice model to the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The Shared Slice model to insert.
	 *
	 * @param slice - The Shared Slice model to insert.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The inserted Shared Slice model.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Shared Slice model
	 *   is provided.
	 * @throws {@link ConflictError} Thrown if a Shared Slice with the given ID
	 *   already exists.
	 */
	async insertSharedSlice<TSharedSliceModel extends prismic.SharedSliceModel>(
		slice: TSharedSliceModel,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TSharedSliceModel> {
		await this.fetch(
			"./slices/insert",
			params,
			createPostFetchRequestInit(slice),
		);

		return slice;
	}

	/**
	 * Updates a Shared Slice model from the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The updated Shared Slice model.
	 *
	 * @param slice - The updated Shared Slice model.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The updated Shared Slice model.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Shared Slice model
	 *   is provided.
	 * @throws {@link NotFoundError} Thrown if a Shared Slice with the given ID
	 *   cannot be found.
	 */
	async updateSharedSlice<TSharedSliceModel extends prismic.SharedSliceModel>(
		slice: TSharedSliceModel,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TSharedSliceModel> {
		await this.fetch(
			"./slices/update",
			params,
			createPostFetchRequestInit(slice),
		);

		return slice;
	}

	/**
	 * Removes a Shared Slice model from the Prismic repository.
	 *
	 * @typeParam TSharedSliceID - The ID of the Shared Slice.
	 *
	 * @param id - The ID of the Shared Slice to remove.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The ID of the removed Shared Slice.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 */
	async removeSharedSlice<TSharedSliceID extends string>(
		id: TSharedSliceID,
		params?: CustomTypesClientMethodParams & FetchParams,
	): Promise<TSharedSliceID> {
		await this.fetch(`./slices/${id}`, params, {
			method: "DELETE",
		});

		return id;
	}

	/**
	 * Performs multiple insert, update, and/or delete operations in a single
	 * transaction.
	 *
	 * @example
	 *
	 * ```ts
	 * const bulkTransaction = createBulkTransaction();
	 * bulkTransaction.insertCustomType(myCustomType);
	 * bulkTransaction.deleteSlice(mySlice);
	 *
	 * await client.bulk(bulkTransaction);
	 * ```
	 *
	 * @param operations - A `BulkTransaction` containing all operations or an
	 *   array of objects describing an operation.
	 * @param params - Parameters that determine how the method behaves and for
	 *   overriding the client's default configuration.
	 *
	 * @returns An array of objects describing the operations.
	 */
	async bulk(
		operations: BulkTransaction | BulkOperation[],
		params?: BulkParams & CustomTypesClientMethodParams & FetchParams,
	): Promise<BulkOperation[]> {
		const resolvedOperations =
			operations instanceof BulkTransaction
				? operations.operations
				: operations;

		await this.fetch(
			"./bulk",
			params,
			createPostFetchRequestInit({
				confirmDeleteDocuments: params?.deleteDocuments ?? false,
				changes: resolvedOperations,
			}),
		);

		return resolvedOperations;
	}

	private async uploadImage(data: Blob): Promise<URL> {
		const acl = await this.fetchScreenshotACL();

		const formData = new FormData();
		for (const fieldKey in acl.formDataFields) {
			formData.append(fieldKey, acl.formDataFields[fieldKey]);
		}

		// TODO: Send the image. See `@slicemachine/manager`'s
		// `SliceManager.prototype.uploadScreenshot` method.
		//
		// Since tokens are secret, this package should only be used on
		// the server, or in very specific browser-side cases.
		//
		// We don't necessarily need to use Node.js-only packages, but
		// we shouldn't be worried too much about installing larger
		// packages.
	}

	private async fetchScreenshotACL(): Promise<ScreenshotACL> {
		if (
			this.screenshotACL &&
			this.screenshotACLExpiresAt &&
			this.screenshotACLExpiresAt < Date.now()
		) {
			return this.screenshotACL;
		}

		const url = new URL("./create", this.screenshotACLEndpoint);
		const res = await this.fetchFn(url.toString(), {
			...this.fetchOptions,
			headers: {
				Authorization: `Bearer ${this.token}`,
				Repository: this.repositoryName,
				...this.fetchOptions?.headers,
			},
		});

		let json: ScreenshotACLResponse;
		try {
			json = await res.json();
		} catch (error) {
			// Response is not JSON
			throw new Error(`Invalid ACL response from ${url}.`, { cause: error });
		}

		if ("values" in json) {
			const acl = {
				uploadEndpoint: json.values.url,
				imgixEndpoint: json.imgixEndpoint,
				formDataFields: json.values.fields,
			};

			this.screenshotACL = acl;
			this.screenshotACLExpiresAt = Date.now() + SCREENSHOT_ACL_TTL;

			return acl;
		}

		if ("error" in json || "message" in json || "Message" in json) {
			const errorMessage = json.error || json.message || json.Message;

			throw new Error(`Failed to create an AWS ACL: ${errorMessage}`);
		}

		throw new Error(`Invalid ACL response from ${url}.`);
	}

	/**
	 * Performs a network request using the configured `fetch` function. It
	 * assumes all successful responses will have a JSON content type. It also
	 * normalizes unsuccessful network requests.
	 *
	 * @typeParam T - The JSON response.
	 *
	 * @param path - URL to the resource to fetch.
	 * @param params - Parameters to override the client's default configuration.
	 * @param requestInit - `RequestInit` overrides for the `fetch` request.
	 *
	 * @returns The response from the network request, if any.
	 *
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make
	 *   requests.
	 * @throws {@link InvalidPayloadError} Thrown if the given body is invalid.
	 * @throws {@link ConflictError} Thrown if an entity with the given ID already
	 *   exists.
	 * @throws {@link NotFoundError} Thrown if the requested entity could not be
	 *   found.
	 */
	private async fetch<T = unknown>(
		path: string,
		params: Partial<CustomTypesClientMethodParams> & FetchParams = {},
		requestInit: RequestInitLike = {},
	): Promise<T> {
		const endpoint = params.endpoint || this.endpoint;
		const url = new URL(
			path,
			endpoint.endsWith("/") ? endpoint : `${endpoint}/`,
		).toString();

		const res = await this.fetchFn(url, {
			...this.fetchOptions,
			...requestInit,
			...params.fetchOptions,
			headers: {
				"Content-Type": "application/json",
				repository: params.repositoryName || this.repositoryName,
				Authorization: `Bearer ${params.token || this.token}`,
				...this.fetchOptions?.headers,
				...requestInit.headers,
				...params.fetchOptions?.headers,
			},
			signal:
				params.fetchOptions?.signal ||
				params.signal ||
				requestInit.signal ||
				this.fetchOptions?.signal,
		});

		switch (res.status) {
			// Successful
			// - Successfully get one or more Custom Types
			// - Successfully get one or more Shared Slices
			case 200: {
				return await res.json();
			}

			// Created
			// - Successfully insert a Custom Type
			// - Successfully insert a Shared Slice
			case 201:
			// No Content
			// - Successfully update a Custom Type
			// - Successfully delete a Custom Type
			// - Successfully update a Shared Slice
			// - Successfully delete a Shared Slice
			case 204: {
				// We use `any` since we don't have a concrete value we can return. We
				// let the call site define what the return type is with the `T` generic.
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return undefined as any;
			}

			// Accepted
			// - Soft limit reached for bulk request (requires confirmation)
			case 202: {
				const json = await res.json();

				throw new BulkTransactionConfirmationError(
					"The bulk transaction will delete documents. Confirm before trying again.",
					{ url, response: json },
				);
			}

			// Bad Request
			// - Invalid body sent
			case 400: {
				const text = await res.text();

				throw new InvalidPayloadError(text, { url, response: text });
			}

			// Unauthorized
			// - User does not have access to requested repository
			case 401: {
				const text = await res.text();

				throw new UnauthorizedError(text, { url, response: text });
			}

			// Forbidden
			// - Missing token
			// - Incorrect token
			// - Hard limit reached for bulk request (cannot process)
			case 403: {
				const json = await res.json();

				if ("details" in json) {
					throw new BulkTransactionLimitError(
						"The bulk transaction reached or surpassed the limit of allowed commands.",
						{ url, response: json },
					);
				}

				throw new ForbiddenError(json.message, { url, response: json });
			}

			// Conflict
			// - Insert a Custom Type with same ID as an existing Custom Type
			// - Insert a Shared Slice with same ID as an existing Shared Slice
			case 409: {
				throw new ConflictError(
					"The provided ID is already used. A unique ID must be provided.",
					{ url },
				);
			}

			// Not Found
			// - Get a Custom Type with no matching ID
			// - Get a Shared Slice with no matching ID
			case 404:
			// Unprocessable Entity
			// - Update a Custom Type with no matching ID
			// - Update a Shared Slice with no matching ID
			case 422: {
				throw new NotFoundError(
					"An entity with a matching ID could not be found.",
					{ url },
				);
			}
		}

		throw new PrismicError("An invalid API response was returned", { url });
	}
}
