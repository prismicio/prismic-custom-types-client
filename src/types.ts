import type * as prismicT from "@prismicio/types";

/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike,
) => Promise<ResponseLike>;

/**
 * An `AbortSignal` provided by an `AbortController`. This allows the network
 * request to be cancelled if necessary.
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal}
 */
// Unfortunately, `signal` types differ too much across implementations. Some
// support providing `null` while others don't. Some include additional methods
// not supported in others.
//
// To ensure maximum compatibility, this is typed as `any`. If the signal is
// invalid, a runtime error may occur.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbortSignalLike = any;

/**
 * A subset of RequestInit properties to configure a `fetch()` request.
 */
// Only options relevant to the client are included. Extending from the full
// RequestInit would cause issues, such as accepting Header objects.
//
// An interface is used to allow other libraries to augment the type with
// environment-specific types.
export interface RequestInitLike extends Partial<Pick<RequestInit, "cache">> {
	// Explicit method names are given for compatibility with `fetch-h2`.
	// Most fetch implementation use `method?: string`, which is compatible
	// with the version defiend here.
	method?: "GET" | "POST" | "DELETE";

	body?: string;

	/**
	 * An object literal to set the `fetch()` request's headers.
	 */
	headers?: Record<string, string>;

	/**
	 * An AbortSignal to set the `fetch()` request's signal.
	 *
	 * See:
	 * [https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
	 */
	// NOTE: `AbortSignalLike` is `any`! It is left as `AbortSignalLike`
	// for backwards compatibility (the type is exported) and to signal to
	// other readers that this should be an AbortSignal-like object.
	signal?: AbortSignalLike;
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
