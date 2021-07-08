import * as prismicT from "@prismicio/types";

/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike,
) => Promise<ResponseLike>;

/**
 * The minimum required properties from RequestInit.
 */
export interface RequestInitLike {
	method?: string;
	body?: string;
	headers?: Record<string, string>;
}

/**
 * The minimum required properties from Response.
 */
export interface ResponseLike {
	status: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	text(): Promise<any>;
}

/**
 * Response from the Custom Types API.
 *
 * @typeParam CustomTypeModel - Custom Type Model returned by the API.
 */
export interface CustomType<
	ID extends string = string,
	CustomTypeModel extends prismicT.CustomTypeModel = prismicT.CustomTypeModel,
> {
	/** The ID of the Custom Type model. */
	id: ID;

	/** The human readable name of the Custom Type Model. */
	label: string;

	/** Determines if more than one document for the Custom Type can be created. */
	repeatable: boolean;

	/** The Custom Type model. */
	json: CustomTypeModel;

	/** Determines if new documents for the Custom Type can be created. */
	status: boolean;
}
