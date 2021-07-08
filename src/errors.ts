type PrismicErrorArgs<TResponse> = {
	url: string;
	response?: TResponse;
};

export class PrismicError<TResponse = never> extends Error {
	url: string;
	response?: TResponse;

	constructor(message: string, args: PrismicErrorArgs<TResponse>) {
		super(message);

		this.url = args.url;
		this.response = args.response;
	}
}

export interface ForbiddenErrorAPIResponse {
	message: string;
}

export class ForbiddenError extends PrismicError<ForbiddenErrorAPIResponse> {}
export class ConflictError extends PrismicError {}
export class NotFoundError extends PrismicError {}
export class InvalidPayloadError extends PrismicError {}
export class MissingFetchError extends Error {}
