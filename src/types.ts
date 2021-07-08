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
	CustomTypeModel extends prismicT.CustomTypeModel = prismicT.CustomTypeModel,
> {
	id: string;
	label: string;
	repeatable: boolean;
	json: CustomTypeModel;
	status: boolean;
}
