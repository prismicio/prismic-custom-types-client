import * as prismicT from "@prismicio/types";

import { FetchLike, RequestInitLike } from "./types";
import {
	PrismicError,
	MissingFetchError,
	ConflictError,
	NotFoundError,
	ForbiddenError,
	InvalidPayloadError,
} from "./errors";

/**
 * The default endpoint for the Prismic Custom Types API.
 */
const DEFAULT_CUSTOM_TYPES_API_ENDPOINT =
	"https://customtypes.prismic.io/customtypes";

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
};

/**
 * Parameters for `CustomTypesClient` methods. Values provided here will
 * override the client's default values, if present.
 */
export type CustomTypesClientMethodParams = Partial<
	Pick<CustomTypesClientConfig, "repositoryName" | "endpoint" | "token">
>;

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
		method: "post",
		body: JSON.stringify(body),
	};
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
	 * Create a client for the Prismic Custom Types API.
	 */
	constructor(config: CustomTypesClientConfig) {
		this.repositoryName = config.repositoryName;
		this.endpoint = config.endpoint || DEFAULT_CUSTOM_TYPES_API_ENDPOINT;
		this.token = config.token;

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
	 * @deprecated Renamed to `getAllCustomTypes`.
	 */
	// TODO: Remove in v1.
	getAll = this.getAllCustomTypes.bind(this);

	/**
	 * Returns all Custom Types models from the Prismic repository.
	 *
	 * @typeParam TCustomType - The Custom Type returned from the API.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns All Custom Type models from the Prismic repository.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 */
	async getAllCustomTypes<TCustomType extends prismicT.CustomTypeModel>(
		params?: CustomTypesClientMethodParams,
	): Promise<TCustomType[]> {
		return await this.fetch<TCustomType[]>("", params);
	}

	/**
	 * @deprecated Renamed to `getCustomTypeByID`.
	 */
	// TODO: Remove in v1.
	getByID = this.getCustomTypeByID.bind(this);

	/**
	 * Returns a Custom Type model with a given ID from the Prismic repository.
	 *
	 * @typeParam TCustomType - The Custom Type returned from the API.
	 * @param id - ID of the Custom Type.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The Custom Type model from the Prismic repository.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link NotFoundError} Thrown if a Custom Type with the given ID
	 *   cannot be found.
	 */
	async getCustomTypeByID<TCustomType extends prismicT.CustomTypeModel>(
		id: string,
		params?: CustomTypesClientMethodParams,
	): Promise<TCustomType> {
		return await this.fetch<TCustomType>(id, params);
	}

	/**
	 * @deprecated Renamed to `insertCustomType`.
	 */
	// TODO: Remove in v1.
	insert = this.insertCustomType.bind(this);

	/**
	 * Inserts a Custom Type model to the Prismic repository.
	 *
	 * @typeParam TCustomType - The Custom Type to insert.
	 * @param customType - The Custom Type to insert.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The inserted Custom Type.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Custom Type is provided.
	 * @throws {@link ConflictError} Thrown if a Custom Type with the given ID
	 *   already exists.
	 */
	async insertCustomType<TCustomType extends prismicT.CustomTypeModel>(
		customType: TCustomType,
		params?: CustomTypesClientMethodParams,
	): Promise<TCustomType> {
		await this.fetch<undefined>(
			"insert",
			params,
			createPostFetchRequestInit(customType),
		);

		return customType;
	}

	/**
	 * @deprecated Renamed to `updateCustomType`.
	 */
	// TODO: Remove in v1.
	update = this.updateCustomType.bind(this);

	/**
	 * Updates a Custom Type model from the Prismic repository.
	 *
	 * @typeParam TCustomType - The updated Custom Type.
	 * @param customType - The updated Custom Type.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The updated Custom Type.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Custom Type is provided.
	 * @throws {@link NotFoundError} Thrown if a Custom Type with the given ID
	 *   cannot be found.
	 */
	async updateCustomType<TCustomType extends prismicT.CustomTypeModel>(
		customType: TCustomType,
		params?: CustomTypesClientMethodParams,
	): Promise<TCustomType> {
		await this.fetch<undefined>(
			"update",
			params,
			createPostFetchRequestInit(customType),
		);

		return customType;
	}

	/**
	 * @deprecated Renamed to `removeCustomType`.
	 */
	// TODO: Remove in v1.
	remove = this.removeCustomType.bind(this);

	/**
	 * Removes a Custom Type model from the Prismic repository.
	 *
	 * @typeParam TCustomTypeID - The ID of the Custom Type.
	 * @param id - The ID of the Custom Type to remove.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The ID of the removed Custom Type.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 */
	async removeCustomType<TCustomTypeID extends string>(
		id: TCustomTypeID,
		params?: CustomTypesClientMethodParams,
	): Promise<TCustomTypeID> {
		await this.fetch<undefined>(id, params, {
			method: "delete",
		});

		return id;
	}

	/**
	 * Returns all Shared Slice models from the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The Shared Slice model returned from the API.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns All Shared Slice models from the Prismic repository.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 */
	async getAllSharedSlices<TSharedSliceModel extends prismicT.SharedSliceModel>(
		params?: CustomTypesClientMethodParams,
	): Promise<TSharedSliceModel[]> {
		return await this.fetch<TSharedSliceModel[]>("/slices", params);
	}

	/**
	 * Returns a Shared Slice model with a given ID from the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The Shared Slice model returned from the API.
	 * @param id - ID of the Shared Slice.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The Shared Slice model from the Prismic repository.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link NotFoundError} Thrown if a Shared Slice with the given ID
	 *   cannot be found.
	 */
	async getSharedSliceByID<TSharedSliceModel extends prismicT.SharedSliceModel>(
		id: string,
		params?: CustomTypesClientMethodParams,
	): Promise<TSharedSliceModel> {
		return await this.fetch<TSharedSliceModel>(`/slices/${id}`, params);
	}

	/**
	 * Inserts a Shared Slice model to the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The Shared Slice model to insert.
	 * @param slice - The Shared Slice model to insert.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The inserted Shared Slice model.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Shared Slice model
	 *   is provided.
	 * @throws {@link ConflictError} Thrown if a Shared Slice with the given ID
	 *   already exists.
	 */
	async insertSharedSlice<TSharedSliceModel extends prismicT.SharedSliceModel>(
		slice: TSharedSliceModel,
		params?: CustomTypesClientMethodParams,
	): Promise<TSharedSliceModel> {
		await this.fetch(
			"/slices/insert",
			params,
			createPostFetchRequestInit(slice),
		);

		return slice;
	}

	/**
	 * Updates a Shared Slice model from the Prismic repository.
	 *
	 * @typeParam TSharedSliceModel - The updated Shared Slice model.
	 * @param slice - The updated Shared Slice model.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The updated Shared Slice model.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link InvalidPayloadError} Thrown if an invalid Shared Slice model
	 *   is provided.
	 * @throws {@link NotFoundError} Thrown if a Shared Slice with the given ID
	 *   cannot be found.
	 */
	async updateSharedSlice<TSharedSliceModel extends prismicT.SharedSliceModel>(
		slice: TSharedSliceModel,
		params?: CustomTypesClientMethodParams,
	): Promise<TSharedSliceModel> {
		await this.fetch(
			"/slices/update",
			params,
			createPostFetchRequestInit(slice),
		);

		return slice;
	}

	/**
	 * Removes a Shared Slice model from the Prismic repository.
	 *
	 * @typeParam TSharedSliceID - The ID of the Shared Slice.
	 * @param id - The ID of the Shared Slice to remove.
	 * @param params - Parameters to override the client's default configuration.
	 *
	 * @returns The ID of the removed Shared Slice.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 */
	async removeSharedSlice<TSharedSliceID extends string>(
		id: TSharedSliceID,
		params?: CustomTypesClientMethodParams,
	): Promise<TSharedSliceID> {
		await this.fetch(`/slices/${id}`, params, {
			method: "delete",
		});

		return id;
	}

	/**
	 * Performs a network request using the configured `fetch` function. It
	 * assumes all successful responses will have a JSON content type. It also
	 * normalizes unsuccessful network requests.
	 *
	 * @typeParam T - The JSON response.
	 * @param url - URL to the resource to fetch.
	 * @param params - Parameters to override the client's default configuration.
	 * @param requestInit - `RequestInit` overrides for the `fetch` request.
	 *
	 * @returns The response from the network request, if any.
	 * @throws {@link ForbiddenError} Thrown if the client is unauthorized to make requests.
	 * @throws {@link InvalidPayloadError} Thrown if the given body is invalid.
	 * @throws {@link ConflictError} Thrown if an entity with the given ID already exists.
	 * @throws {@link NotFoundError} Thrown if the requested entity could not be found.
	 */
	private async fetch<T = unknown>(
		path: string,
		params: Partial<CustomTypesClientMethodParams> = {},
		requestInit: RequestInitLike = {},
	): Promise<T> {
		const url = new URL(
			path,
			`${params.endpoint || this.endpoint}/`,
		).toString();

		const res = await this.fetchFn(url, {
			headers: {
				"Content-Type": "application/json",
				repository: params.repositoryName || this.repositoryName,
				Authorization: `Bearer ${params.token || this.token}`,
			},
			...requestInit,
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

			// Bad Request
			// - Invalid body sent
			case 400: {
				const text = await res.text();

				throw new InvalidPayloadError(text, { url, response: text });
			}

			// Forbidden
			// - Missing token
			// - Incorrect token
			case 403: {
				const json = await res.json();

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
