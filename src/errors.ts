/**
 * Metadata about the failed Prismic Custom Types API request.
 */
type PrismicErrorArgs<TResponse> = {
	/**
	 * The Prismic Custom Types API URL used for the failed request.
	 */
	url: string;

	/**
	 * The Prismic Custom Types API response from the failed request.
	 */
	response?: TResponse;
};

/**
 * An error returned from the Prismic Custom Types API. It contains information
 * about the network request to aid in debugging.
 */
export class PrismicError<TResponse = never> extends Error {
	/**
	 * The Prismic Custom Types API URL used for the failed request.
	 */
	url: string;

	/**
	 * The Prismic Custom Types API response from the failed request.
	 */
	response?: TResponse;

	/**
	 * Creates a new `PrismicError`.
	 *
	 * @param message - A description of the error.
	 * @param args - Metadata about the failed network request.
	 *
	 * @returns A `PrismicError` for the given error state.
	 */
	constructor(message: string, args: PrismicErrorArgs<TResponse>) {
		super(message);

		this.url = args.url;
		this.response = args.response;
	}
}

/**
 * The response returned by the Prismic Custom Types API when unauthorized.
 */
export interface ForbiddenErrorAPIResponse {
	/**
	 * Description of the error.
	 */
	message: string;
}

/**
 * Represents an error when making an unauthorized Prismic Custom Types API
 * request.
 */
export class UnauthorizedError extends PrismicError<string> {}

/**
 * Represents an error when making a forbidden Prismic Custom Types API request.
 */
export class ForbiddenError extends PrismicError<ForbiddenErrorAPIResponse> {}

/**
 * Represents an error when an entity with the same ID already exists.
 */
export class ConflictError extends PrismicError {}

/**
 * Represents an error when the requested entity could not be found.
 */
export class NotFoundError extends PrismicError {}

/**
 * Represents an error when the provided data is invalid.
 */
export class InvalidPayloadError extends PrismicError<string> {}

/**
 * Represents an error when a valid `fetch` function is not available to the
 * Prismic Custom Types API client.
 */
export class MissingFetchError extends Error {}
