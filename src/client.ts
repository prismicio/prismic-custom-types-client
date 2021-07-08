import * as prismicT from "@prismicio/types";

import { CustomType, FetchLike, RequestInitLike } from "./types";
import {
	PrismicError,
	MissingFetchError,
	ConflictError,
	NotFoundError,
	ForbiddenError,
	InvalidPayloadError,
} from "./errors";

const DEFAULT_CUSTOM_TYPES_API_ENDPOINT =
	"https://customtypes.prismic.io/customtypes";

export type CustomTypesClientConfig = {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard Custom Types API endpoint will be used if no value is provided.
	 */
	endpoint?: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is required to call any Custom Type API methods.
	 */
	token: string;

	/**
	 * The function used to make network requests to the Prismic Custom Types API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
	 */
	fetch?: FetchLike;
};

export type CustomTypesAPIParams = Partial<
	Pick<CustomTypesClientConfig, "repositoryName" | "endpoint" | "token">
>;

const createPostFetchRequestInit = <T>(body: T): RequestInitLike => {
	return {
		method: "post",
		body: JSON.stringify(body),
	};
};

export const createClient = (
	...args: ConstructorParameters<typeof CustomTypesClient>
): CustomTypesClient => new CustomTypesClient(...args);

export class CustomTypesClient {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard Custom Types API endpoint will be used if no value is provided.
	 */
	endpoint: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is required to call any Custom Type API methods.
	 */
	token: string;

	/**
	 * The function used to make network requests to the Prismic Custom Types API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
	 */
	fetchFn: FetchLike;

	constructor(options: CustomTypesClientConfig) {
		this.repositoryName = options.repositoryName;
		this.endpoint = options.endpoint || DEFAULT_CUSTOM_TYPES_API_ENDPOINT;
		this.token = options.token;

		if (typeof options.fetch === "function") {
			this.fetchFn = options.fetch;
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch;
		} else {
			throw new MissingFetchError(
				"A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.",
			);
		}

		// If the global fetch function is used, we must bind it to the global scope.
		if (this.fetchFn === globalThis.fetch) {
			this.fetchFn = this.fetchFn.bind(globalThis);
		}
	}

	async getAll<TCustomTypeModel extends prismicT.CustomTypeModel>(
		params?: CustomTypesAPIParams,
	): Promise<CustomType<TCustomTypeModel>[]> {
		return await this.fetch<CustomType<TCustomTypeModel>[]>("", params);
	}

	async getByID<TCustomTypeModel extends prismicT.CustomTypeModel>(
		id: string,
		params?: CustomTypesAPIParams,
	): Promise<CustomType<TCustomTypeModel>> {
		return await this.fetch<CustomType<TCustomTypeModel>>(id, params);
	}

	async insert<TCustomTypeModel extends prismicT.CustomTypeModel>(
		customType: CustomType<TCustomTypeModel>,
		params?: CustomTypesAPIParams,
	): Promise<CustomType<TCustomTypeModel>> {
		await this.fetch("insert", params, createPostFetchRequestInit(customType));

		return customType;
	}

	async update<TCustomTypeModel extends prismicT.CustomTypeModel>(
		customType: CustomType<TCustomTypeModel>,
		params?: CustomTypesAPIParams,
	): Promise<CustomType<TCustomTypeModel>> {
		await this.fetch("update", params, createPostFetchRequestInit(customType));

		return customType;
	}

	async remove<TCustomTypeID extends string>(
		id: TCustomTypeID,
		params?: CustomTypesAPIParams,
	): Promise<TCustomTypeID> {
		await this.fetch(id, params, { method: "delete" });

		return id;
	}

	async getAllSharedSlices<TSharedSliceModel extends prismicT.SharedSliceModel>(
		params?: CustomTypesAPIParams,
	): Promise<TSharedSliceModel[]> {
		return await this.fetch<TSharedSliceModel[]>("slices", params);
	}

	async getSharedSliceByID<TSharedSliceModel extends prismicT.SharedSliceModel>(
		id: string,
		params?: CustomTypesAPIParams,
	): Promise<TSharedSliceModel> {
		return await this.fetch<TSharedSliceModel>(`slices/${id}`, params);
	}

	async insertSharedSlice<TSharedSliceModel extends prismicT.SharedSliceModel>(
		slice: TSharedSliceModel,
		params?: CustomTypesAPIParams,
	): Promise<TSharedSliceModel> {
		await this.fetch(
			"slices/insert",
			params,
			createPostFetchRequestInit(slice),
		);

		return slice;
	}

	async updateSharedSlice<TSharedSliceModel extends prismicT.SharedSliceModel>(
		slice: TSharedSliceModel,
		params?: CustomTypesAPIParams,
	): Promise<TSharedSliceModel> {
		await this.fetch(
			"slices/update",
			params,
			createPostFetchRequestInit(slice),
		);

		return slice;
	}

	async removeSharedSlice<TSharedSliceID extends string>(
		id: TSharedSliceID,
		params?: CustomTypesAPIParams,
	): Promise<TSharedSliceID> {
		await this.fetch(`slices/${id}`, params, {
			method: "delete",
		});

		return id;
	}

	/**
	 * Performs a network request using the configured `fetch` function. It assumes all successful responses will have a JSON content type. It also normalizes unsuccessful network requests.
	 *
	 * @typeParam T The JSON response.
	 *
	 * @param url URL to the resource to fetch.
	 * @param params Prismic REST API parameters for the network request.
	 *
	 * @returns The JSON response from the network request.
	 */
	private async fetch<T = unknown>(
		path: string,
		params: Partial<CustomTypesAPIParams> = {},
		requestOptions: RequestInitLike = {},
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
			...requestOptions,
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
