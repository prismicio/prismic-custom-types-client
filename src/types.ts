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
 * The minimum required properties from RequestInit.
 */
export interface RequestInitLike {
	// Explicit method names are given for compatibility with `fetch-h2`.
	// Most fetch implementation use `method?: string`, which is compatible
	// with the version defiend here.
	method?: "GET" | "POST" | "DELETE";
	body?: string;
	headers?: Record<string, string>;
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
